"use client";

import {
  Handle,
  type Node,
  type NodeProps,
  Position,
  type Edge,
} from "@xyflow/react";
import { useEffect, useState, useRef, type KeyboardEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { nodeSchema } from "@/types/schema";
import { generateId } from "ai";
import useStore from "@/store/node-store";
import type { AppNode } from "@/store/types";
import { Loader2, SendHorizontal, AlertCircle } from "lucide-react";
import { cn } from "@/library/utils";
import { nodeStyles } from "@/styles/node-styles";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSubmit = () => {
    if (!prompt.trim()) return;

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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  return (
    <Card className={nodeStyles.card}>
      <CardHeader className={nodeStyles.header}>
        <CardTitle className={nodeStyles.title}>💭 Prompt</CardTitle>
      </CardHeader>
      <CardContent className={nodeStyles.content}>
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your prompt..."
            className={cn(
              "min-h-[80px] resize-none transition-colors",
              error && "border-destructive",
              isLoading && "opacity-50",
            )}
            disabled={isLoading}
          />
          {error && (
            <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Failed to generate response</span>
            </div>
          )}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!prompt.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <SendHorizontal className="mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </Button>
        <div className="text-center text-xs text-muted-foreground">
          Press {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"} + Enter to
          generate
        </div>
      </CardContent>
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
