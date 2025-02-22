"use client";

import { PromptNode } from "@/components/nodes/prompt-node";
import { TaskNode } from "@/components/nodes/task-node";
import useStore from "@/store/node-store";
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

export default function HomePage() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
    })),
  );
  const nodeTypes = useMemo(
    () => ({
      prompt: PromptNode,
      task: TaskNode,
    }),
    [],
  );
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
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        />
      </ReactFlowProvider>
    </div>
  );
}
