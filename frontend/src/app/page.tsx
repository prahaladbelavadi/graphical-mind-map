"use client";

import { PromptNode } from "@/components/nodes/prompt-node";
import { TaskNode } from "@/components/nodes/task-node";
import { DecisionNode } from "@/components/nodes/decision-node";
import useStore from "@/store/node-store";
import { Background, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import useLayout from "@/hooks/use-layout";
import { CodeNode } from "@/components/nodes/code-node";

export function Home() {
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
      decision: DecisionNode,
      code: CodeNode,
    }),
    [],
  );
  useLayout();
  return (
    <div className="h-screen w-full">
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
      >
        <Background />
      </ReactFlow>
    </div>
  );
}

export default function HomePage() {
  return (
    <ReactFlowProvider>
      <Home />
    </ReactFlowProvider>
  );
}
