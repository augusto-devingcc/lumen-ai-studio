"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import type { AssetType, FlowNodeData, FlowNodeKind } from "@/lib/types";
import { callGenerate } from "./studio-store";
import { VOICES } from "@/lib/providers/models";

export type FlowNode = Node<FlowNodeData>;

interface NodeOutput {
  text?: string;
  url?: string;
  type?: AssetType;
  provider?: import("@/lib/types").ProviderName;
  mock?: boolean;
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function defaultsFor(kind: FlowNodeKind): FlowNodeData {
  switch (kind) {
    case "prompt":
      return { kind, label: "Prompt", text: "", status: "idle" };
    case "image":
      return { kind, label: "Image", model: "flux-schnell", aspectRatio: "1:1", status: "idle" };
    case "video":
      return { kind, label: "Video", model: "ltx-video", aspectRatio: "16:9", status: "idle" };
    case "audio":
      return { kind, label: "Audio", voice: VOICES[0]?.value, status: "idle" };
    case "output":
      return { kind, label: "Output", status: "idle" };
  }
}

function topoSort(nodes: FlowNode[], edges: Edge[]): FlowNode[] {
  const indeg = new Map<string, number>(nodes.map((n) => [n.id, 0]));
  const adj = new Map<string, string[]>(nodes.map((n) => [n.id, []]));
  for (const e of edges) {
    if (adj.has(e.source) && indeg.has(e.target)) {
      adj.get(e.source)!.push(e.target);
      indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
    }
  }
  const queue = nodes.filter((n) => (indeg.get(n.id) ?? 0) === 0).map((n) => n.id);
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const t of adj.get(id) ?? []) {
      indeg.set(t, (indeg.get(t) ?? 0) - 1);
      if ((indeg.get(t) ?? 0) === 0) queue.push(t);
    }
  }
  for (const n of nodes) if (!order.includes(n.id)) order.push(n.id); // leftover cycles
  return order
    .map((id) => nodes.find((n) => n.id === id))
    .filter((n): n is FlowNode => Boolean(n));
}

interface FlowsState {
  nodes: FlowNode[];
  edges: Edge[];
  selectedId: string | null;
  isRunning: boolean;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (kind: FlowNodeKind, position?: { x: number; y: number }) => void;
  updateNodeData: (id: string, patch: Partial<FlowNodeData>) => void;
  removeNode: (id: string) => void;
  select: (id: string | null) => void;
  clear: () => void;
  setGraph: (nodes: FlowNode[], edges: Edge[]) => void;
  loadStarter: () => void;
  /** Build a prompt → steps → output chain (used by the Chat `create_flow` tool). */
  createFlow: (prompt: string, steps: AssetType[]) => void;
  /** Seed a flow from an existing Studio asset as a locked source (Studio → Flows). */
  startFromAsset: (asset: import("@/lib/types").GeneratedAsset) => void;
  runFlow: () => Promise<void>;
}

function chainEdges(ids: string[]): Edge[] {
  const edges: Edge[] = [];
  for (let i = 0; i < ids.length - 1; i++) {
    edges.push({ id: newId(), source: ids[i], target: ids[i + 1], animated: true });
  }
  return edges;
}

export const useFlowsStore = create<FlowsState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedId: null,
      isRunning: false,

      onNodesChange: (changes) =>
        set({ nodes: applyNodeChanges(changes, get().nodes) as FlowNode[] }),
      onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
      onConnect: (connection) =>
        set({ edges: addEdge({ ...connection, animated: true }, get().edges) }),

      addNode: (kind, position) => {
        const count = get().nodes.length;
        const node: FlowNode = {
          id: newId(),
          type: "lumen",
          position: position ?? { x: 80 + (count % 4) * 60, y: 60 + count * 36 },
          data: defaultsFor(kind),
        };
        set({ nodes: [...get().nodes, node], selectedId: node.id });
      },

      updateNodeData: (id, patch) =>
        set({
          nodes: get().nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
          ),
        }),

      removeNode: (id) =>
        set({
          nodes: get().nodes.filter((n) => n.id !== id),
          edges: get().edges.filter((e) => e.source !== id && e.target !== id),
          selectedId: get().selectedId === id ? null : get().selectedId,
        }),

      select: (id) => set({ selectedId: id }),

      clear: () => set({ nodes: [], edges: [], selectedId: null }),

      setGraph: (nodes, edges) => set({ nodes, edges, selectedId: null }),

      loadStarter: () => {
        const promptId = newId();
        const imageId = newId();
        const outputId = newId();
        const nodes: FlowNode[] = [
          {
            id: promptId,
            type: "lumen",
            position: { x: 40, y: 120 },
            data: {
              ...defaultsFor("prompt"),
              text: "A neon koi fish swimming through a misty bamboo forest, cinematic",
            },
          },
          { id: imageId, type: "lumen", position: { x: 300, y: 120 }, data: defaultsFor("image") },
          { id: outputId, type: "lumen", position: { x: 560, y: 120 }, data: defaultsFor("output") },
        ];
        const edges: Edge[] = [
          { id: newId(), source: promptId, target: imageId, animated: true },
          { id: newId(), source: imageId, target: outputId, animated: true },
        ];
        set({ nodes, edges, selectedId: null });
      },

      createFlow: (prompt, steps) => {
        const promptNode: FlowNode = {
          id: newId(),
          type: "lumen",
          position: { x: 40, y: 140 },
          data: { ...defaultsFor("prompt"), text: prompt },
        };
        const stepNodes: FlowNode[] = steps.map((kind, i) => ({
          id: newId(),
          type: "lumen",
          position: { x: 40 + (i + 1) * 230, y: 140 },
          data: defaultsFor(kind),
        }));
        const outputNode: FlowNode = {
          id: newId(),
          type: "lumen",
          position: { x: 40 + (steps.length + 1) * 230, y: 140 },
          data: defaultsFor("output"),
        };
        const nodes = [promptNode, ...stepNodes, outputNode];
        set({ nodes, edges: chainEdges(nodes.map((n) => n.id)), selectedId: null });
      },

      startFromAsset: (asset) => {
        const source: FlowNode = {
          id: newId(),
          type: "lumen",
          position: { x: 40, y: 140 },
          data: {
            ...defaultsFor(asset.type === "audio" ? "audio" : asset.type),
            label: "Source",
            locked: true,
            status: "done",
            resultUrl: asset.url,
            resultType: asset.type,
            resultProvider: asset.provider,
            resultMock: asset.mock,
          },
        };
        // An image source flows into a Video node (animate it); others go straight to Output.
        const middle: FlowNode[] =
          asset.type === "image"
            ? [
                {
                  id: newId(),
                  type: "lumen",
                  position: { x: 270, y: 140 },
                  data: defaultsFor("video"),
                },
              ]
            : [];
        const output: FlowNode = {
          id: newId(),
          type: "lumen",
          position: { x: 270 + middle.length * 230, y: 140 },
          data: defaultsFor("output"),
        };
        const nodes = [source, ...middle, output];
        set({ nodes, edges: chainEdges(nodes.map((n) => n.id)), selectedId: null });
      },

      runFlow: async () => {
        if (get().isRunning || get().nodes.length === 0) return;
        set({ isRunning: true });
        // reset runtime state — but keep locked source nodes (they carry a fixed asset).
        set({
          nodes: get().nodes.map((n) =>
            n.data.locked
              ? { ...n, data: { ...n.data, status: "done", error: undefined } }
              : { ...n, data: { ...n.data, status: "idle", error: undefined, resultUrl: undefined } },
          ),
        });

        const edges = get().edges;
        const order = topoSort(get().nodes, edges);
        const outputs = new Map<string, NodeOutput>();

        const patch = (id: string, p: Partial<FlowNodeData>) =>
          set({
            nodes: get().nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...p } } : n)),
          });

        for (const node of order) {
          const incoming = edges
            .filter((e) => e.target === node.id)
            .map((e) => outputs.get(e.source))
            .filter((o): o is NodeOutput => Boolean(o));
          const upstreamText = incoming.find((o) => o.text)?.text;
          const upstreamImage = incoming.find((o) => o.type === "image")?.url;
          const d = node.data;

          try {
            if (d.kind === "prompt") {
              outputs.set(node.id, { text: d.text ?? "" });
              patch(node.id, { status: "done" });
              continue;
            }
            if (d.kind === "output") {
              const out = incoming[0];
              outputs.set(node.id, out ?? {});
              patch(node.id, {
                status: out?.url ? "done" : "error",
                resultUrl: out?.url,
                resultType: out?.type,
                resultProvider: out?.provider,
                resultMock: out?.mock,
                error: out?.url ? undefined : "No media input connected.",
              });
              continue;
            }

            // Locked source node (asset sent from Studio): pass through, don't regenerate.
            if (d.locked && d.resultUrl) {
              outputs.set(node.id, {
                url: d.resultUrl,
                type: d.resultType ?? (d.kind as AssetType),
                provider: d.resultProvider,
                mock: d.resultMock,
              });
              patch(node.id, { status: "done" });
              continue;
            }

            patch(node.id, { status: "running" });
            const prompt = upstreamText ?? d.text ?? "";

            if (d.kind === "image") {
              if (!prompt) {
                outputs.set(node.id, {});
                patch(node.id, { status: "error", error: "Needs a prompt (connect a Prompt node)." });
                continue;
              }
              const r = await callGenerate({
                type: "image",
                model: d.model ?? "flux-schnell",
                prompt,
                aspectRatio: d.aspectRatio,
              });
              if (r.ok) {
                outputs.set(node.id, { url: r.url, type: "image", provider: r.provider, mock: r.mock });
                patch(node.id, {
                  status: "done",
                  resultUrl: r.url,
                  resultType: "image",
                  resultProvider: r.provider,
                  resultMock: r.mock,
                });
              } else {
                outputs.set(node.id, {});
                patch(node.id, { status: "error", error: r.error });
              }
            } else if (d.kind === "video") {
              const r = await callGenerate({
                type: "video",
                model: d.model ?? "ltx-video",
                prompt: prompt || "cinematic shot",
                aspectRatio: d.aspectRatio ?? "16:9",
                imageUrl: upstreamImage,
              });
              if (r.ok) {
                outputs.set(node.id, { url: r.url, type: "video", provider: r.provider, mock: r.mock });
                patch(node.id, {
                  status: "done",
                  resultUrl: r.url,
                  resultType: "video",
                  resultProvider: r.provider,
                  resultMock: r.mock,
                });
              } else {
                outputs.set(node.id, {});
                patch(node.id, { status: "error", error: r.error });
              }
            } else {
              // audio
              if (!prompt) {
                outputs.set(node.id, {});
                patch(node.id, { status: "error", error: "Needs text (connect a Prompt node)." });
                continue;
              }
              const r = await callGenerate({
                type: "audio",
                model: "elevenlabs-tts",
                prompt,
                voice: d.voice,
              });
              if (r.ok) {
                outputs.set(node.id, { url: r.url, type: "audio", provider: r.provider, mock: r.mock });
                patch(node.id, {
                  status: "done",
                  resultUrl: r.url,
                  resultType: "audio",
                  resultProvider: r.provider,
                  resultMock: r.mock,
                });
              } else {
                outputs.set(node.id, {});
                patch(node.id, { status: "error", error: r.error });
              }
            }
          } catch {
            outputs.set(node.id, {});
            patch(node.id, { status: "error", error: "Execution failed." });
          }
        }

        set({ isRunning: false });
      },
    }),
    {
      name: "lumen-flows",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.nodes = state.nodes.map((n) => ({
            ...n,
            data: { ...n.data, status: "idle", error: undefined },
          }));
        }
      },
    },
  ),
);
