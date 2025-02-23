"use client";

import {
  type Edge,
  Handle,
  type Node,
  type NodeProps,
  Position,
} from "@xyflow/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { nodeSchema } from "@/types/schema";
import { generateId } from "ai";
import useStore from "@/store/node-store";
import type { AppNode } from "@/store/types";
import { nodeStyles } from "@/styles/node-styles";
import { BookOpen, Hash } from "lucide-react";
import { useCallback } from "react";
import { Button } from "../ui/button";

type InformationNode = Node<{
  content: string;
  references: string[];
  tags: string[];
}>;

export function InformationNode({
  id,
  data,
  isConnectable,
}: NodeProps<InformationNode>) {
  const { setNodes, setEdges, nodes, edges, addPromptNode } = useStore();

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
  const handleAddPromptNode = useCallback(() => {
    addPromptNode(id);
  }, [addPromptNode, id]);
  return (
    <Card className={nodeStyles.card}>
      <CardHeader className={nodeStyles.header}>
        <CardTitle className={nodeStyles.title}>📚 Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <ScrollArea
          className="h-[120px] w-full rounded-md"
          onWheel={(e) => e.stopPropagation()}
        >
          <p className="text-sm leading-relaxed text-muted-foreground">
            {data.content}
          </p>
        </ScrollArea>

        {data.references.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              <span>References</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {data.references.map((ref, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-muted/50 text-xs"
                >
                  {ref}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {data.tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Hash className="h-3 w-3" />
              <span>Tags</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {data.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
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
