"use client";

import { ReactFlow, Background, BackgroundVariant, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "./nodes";
import { useFlowsStore } from "@/lib/store/flows-store";

export function FlowCanvas() {
  const nodes = useFlowsStore((s) => s.nodes);
  const edges = useFlowsStore((s) => s.edges);
  const onNodesChange = useFlowsStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowsStore((s) => s.onEdgesChange);
  const onConnect = useFlowsStore((s) => s.onConnect);
  const select = useFlowsStore((s) => s.select);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => select(node.id)}
      onPaneClick={() => select(null)}
      fitView
      colorMode="dark"
      proOptions={{ hideAttribution: true }}
      className="bg-background"
    >
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="var(--border)" />
      <Controls className="!border-border !bg-card" showInteractive={false} />
      <MiniMap
        pannable
        zoomable
        className="!bg-card"
        maskColor="color-mix(in oklch, var(--background) 70%, transparent)"
        nodeColor="var(--muted-foreground)"
      />
    </ReactFlow>
  );
}
