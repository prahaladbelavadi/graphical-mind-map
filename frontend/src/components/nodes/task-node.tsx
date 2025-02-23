"use client";

import {
  Handle,
  type Node,
  type NodeProps,
  Position,
  type Edge,
} from "@xyflow/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { nodeSchema } from "@/types/schema";
import { generateId } from "ai";
import useStore from "@/store/node-store";
import type { AppNode } from "@/store/types";
import { nodeStyles } from "@/styles/node-styles";
import { cn } from "@/library/utils";
import { useCallback } from "react";
import { Button } from "../ui/button";
export type TaskNodeData = Node<{
  name: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
}>;

const difficultyColors = {
  easy: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10",
  medium: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/10",
  hard: "bg-rose-500/10 text-rose-500 hover:bg-rose-500/10",
} as const;

export function TaskNode({ id, data, isConnectable }: NodeProps<TaskNodeData>) {
  const { nodes, edges, setNodes, setEdges, addPromptNode } = useStore();

  const { submit, isLoading, error, object } = useObject({
    id,
    api: "/api/ai",
    schema: nodeSchema,
    onFinish: ({ object }) => {
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
  const handleAddPromptNode = useCallback(() => {
    addPromptNode(id);
  }, [addPromptNode, id]);
  return (
    <Card className={nodeStyles.card}>
      <CardHeader className={nodeStyles.header}>
        <CardTitle className={nodeStyles.title}>✨ Task</CardTitle>
      </CardHeader>
      <CardContent className={nodeStyles.content}>
        <div className="space-y-2">
          <h3 className="font-semibold leading-none tracking-tight">
            {data.name}
          </h3>
          <p className="text-sm text-muted-foreground">{data.description}</p>
          <Badge
            variant="secondary"
            className={cn("font-normal", difficultyColors[data.difficulty])}
          >
            {data.difficulty}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleAddPromptNode}>
          Add Prompt
        </Button>
      </CardFooter>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className={nodeStyles.handle}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className={nodeStyles.handle}
      />
    </Card>
  );
}
