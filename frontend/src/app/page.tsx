"use client"

import { PromptNode } from "@/components/nodes/prompt-node";
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { useMemo } from "react";

const initialNodes = [
  { id: '1', type: 'prompt', position: { x: 0, y: 0 }, data: { prompt: 'Hello, world!' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
];

export default function HomePage() {
  const nodeTypes = useMemo(() => ({
    prompt: PromptNode,
  }), []);
  return (
   <div className="h-screen w-full">
   <ReactFlowProvider>
    <ReactFlow
    fitView
colorMode="dark"
      nodeTypes={nodeTypes}
      proOptions={{
        hideAttribution: true,
      }}
      nodes={initialNodes}
      edges={initialEdges}
    />
   </ReactFlowProvider>
   </div>
  );
}
