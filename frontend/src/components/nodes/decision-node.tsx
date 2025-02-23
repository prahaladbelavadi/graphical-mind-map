"use client";

import {
  type Edge,
  Handle,
  type Node,
  type NodeProps,
  Position,
} from "@xyflow/react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { nodeSchema } from "@/types/schema";
import { generateId } from "ai";
import useStore from "@/store/node-store";
import type { AppNode } from "@/store/types";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/library/utils";
import { Separator } from "../ui/separator";

export type DecisionNodeData = Node<{
  question: string;
  options: string[];
}>;

export function DecisionNode({
  id,
  data,
  isConnectable,
}: NodeProps<DecisionNodeData>) {
  const { setNodes, setEdges, nodes, edges, addPromptNode } = useStore();
  const [question] = useState(data.question);
  const [options] = useState(data.options);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const { submit, isLoading, error, object } = useObject({
    id,
    api: "/api/ai",
    schema: nodeSchema,
    onFinish: ({ object }) => {
      const newNodes: AppNode[] = [];
      const newEdges: Edge[] = [];

      const parentNode = useStore
        .getState()
        .nodes.find((node) => node.id === id);

      if (!parentNode) {
        console.error("Parent node not found");
        return;
      }

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
      setEdges([...edges, ...newEdges]);
      setNodes([...nodes, ...newNodes]);
    },
  });

  const handleSubmit = (option: string) => {
    setSelectedOption(option);

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
      messages: [
        {
          role: "user",
          content: `Selected option: "${option}" for the question: "${question}"`,
        },
      ],
      nodeTree: contextNodes,
      edgeTree: contextEdges,
      currentNodeId: id,
      currentNodeType: "decision",
    });
  };

  const handleAddPromptNode = () => {
    addPromptNode(id);
  };

  return (
    <Card className="min-h-[200px] w-[300px]">
      <CardHeader className="space-y-0 border-b px-4 py-2">
        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
          🤔 Decision
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4">
        <p className="text-sm text-muted-foreground">{question}</p>
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to process selection</span>
          </div>
        )}
        <div className="grid gap-2">
          {options.map((option) => (
            <Button
              key={option}
              onClick={() => handleSubmit(option)}
              disabled={isLoading}
              variant={selectedOption === option ? "default" : "outline"}
              className={cn(
                "h-auto w-full justify-start px-4 py-3 text-left transition-all",
                selectedOption === option && "font-medium",
                isLoading && selectedOption === option && "opacity-70",
              )}
            >
              <span className="flex-1">{option}</span>
              {isLoading && selectedOption === option && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
            </Button>
          ))}
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
        className="h-3 w-3 border-2"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="h-3 w-3 border-2"
      />
    </Card>
  );
}
