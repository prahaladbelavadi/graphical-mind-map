"use client";

import { Handle, Node, NodeProps, Position, Edge } from "@xyflow/react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { nodeSchema } from "@/types/schema";
import { generateId } from "ai";
import useStore from "@/store/node-store";
import { AppNode } from "@/store/types";
export type PromptNodeData = Node<{
  prompt: string;
}>;

export function PromptNode({
  id,
  data,
  isConnectable,
}: NodeProps<PromptNodeData>) {
  const { nodes, edges, setNodes, setEdges } = useStore();
  const [prompt, setPrompt] = useState(data.prompt);
  const { submit, isLoading, error, object } = useObject({
    id,
    api: "/api/ai",
    schema: nodeSchema,
    onFinish: ({ object }) => {
      console.log(object);
      const newNodes: AppNode[] = [];
      const newEdges: Edge[] = [];
      if (object?.nodes.length) {
        object.nodes.forEach((node) => {
          const newNodeId = generateId();
          const newNode = {
            id: newNodeId,
            type: node.type,
            data: node.data,
            position: { x: 0, y: 0 },
            parentId: id,
          };
          const newEdge = {
            id: `${id}-${newNodeId}`,
            source: id,
            target: newNodeId,
          };
          newNodes.push(newNode);
          newEdges.push(newEdge);
        });
      }
      setNodes([...nodes, ...newNodes]);
      setEdges([...edges, ...newEdges]);
    },
  });
  // Streamed object
  // useEffect(() => {
  //   if (object) {
  //     console.log(object);
  //   }
  // }, [object]);
  const handleSubmit = () => {
    if (!prompt.trim()) {
      return;
    }
    // Get current nodes and edges, except for child nodes of the current node
    const contextNodes = useStore
      .getState()
      .nodes.filter((node) => !node.id.startsWith(`${id}-`))
      .map(({ type, data, id }) => ({
        id,
        type,
        data,
      }));
    const contextEdges = useStore
      .getState()
      .edges.filter((edge) => !edge.target.startsWith(`${id}-`))
      .map(({ id, source, target }) => ({
        id,
        source,
        target,
      }));

    submit({
      messages: [{ role: "user", content: prompt }],
      nodeTree: contextNodes,
      edgeTree: contextEdges,
      currentNodeId: id,
      currentNodeType: "prompt",
    });
  };
  return (
    <Card className="w-[300px]">
      <CardContent className="flex flex-col gap-2 p-2">
        <Input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button onClick={handleSubmit}>Generate</Button>
      </CardContent>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </Card>
  );
}
