// Shared domain types for Lumen. Single source of truth — do not redefine ad-hoc.

export type AssetType = "image" | "video" | "audio";

export type AssetStatus = "pending" | "done" | "error";

/** A media asset produced by a generation (lives in the Studio history store). */
export interface GeneratedAsset {
  id: string;
  type: AssetType;
  /** URL or data URI of the result. */
  url: string;
  prompt: string;
  model: string;
  provider: ProviderName;
  /** Mock results are flagged so the UI can label them honestly. */
  mock: boolean;
  createdAt: number;
  status: AssetStatus;
  error?: string;
  meta: AssetMeta;
}

export interface AssetMeta {
  width?: number;
  height?: number;
  aspectRatio?: AspectRatio;
  seed?: number;
  durationSec?: number;
  voice?: string;
  /** Rough cost estimate in USD, if known. */
  estCostUsd?: number;
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export type ProviderName = "fal" | "replicate" | "elevenlabs" | "mock";

// ---- Model catalog (what the Studio model picker offers) ----

export interface ModelOption {
  id: string;
  label: string;
  type: AssetType;
  /** Provider this model is served from. */
  provider: ProviderName;
  description?: string;
}

// ---- Flows (node graph) ----

export type FlowNodeKind = "prompt" | "image" | "video" | "audio" | "output";

export type FlowRunStatus = "idle" | "running" | "done" | "error";

/** Data carried by each React Flow node. (type, not interface, to satisfy Record<string, unknown>.) */
export type FlowNodeData = {
  kind: FlowNodeKind;
  label: string;
  // editable params
  text?: string; // prompt text / text-to-speak
  model?: string;
  aspectRatio?: AspectRatio;
  voice?: string;
  /** Locked source node (e.g. an asset sent from Studio): passes its result through without regenerating. */
  locked?: boolean;
  // runtime state
  status: FlowRunStatus;
  resultUrl?: string;
  resultType?: AssetType;
  resultProvider?: ProviderName;
  resultMock?: boolean;
  error?: string;
};
