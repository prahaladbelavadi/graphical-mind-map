"use client";

import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { nodeSchema } from "@/types/schema";
import { generateId } from "ai";
import useStore from "@/store/node-store";
import type { AppNode } from "@/store/types";
import type { Edge } from "@xyflow/react";

type CodeNode = Node<{
  explanation: string;
  code: string;
}>;

export function CodeNode({ id, data, isConnectable }: NodeProps<CodeNode>) {
  const [prompt, setPrompt] = useState(data.explanation);
  const [code, setCode] = useState(data.code);
  const [loading, setLoading] = useState(true);
  const { setNodes, setEdges } = useStore();

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
      setNodes(newNodes);
      setEdges(newEdges);
    },
  });

  const handleSubmit = () => {
    // setCode(code)
    // submit({ prompt })
  };

  return (
    <Card className="min-h-[200px] w-[300px]">
      <CardHeader className="space-y-0 border-b px-4 py-2">
        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
          🔧 Code
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea
          className="h-[200px] w-full rounded-md"
          onWheel={(e) => e.stopPropagation()}
        >
          <pre className="bg-muted/50 p-4">
            <code className="whitespace-pre-wrap break-words font-mono text-sm text-foreground">
              {code}
            </code>
          </pre>
        </ScrollArea>
      </CardContent>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="h-3 w-3 border-2"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className="h-3 w-3 border-2"
      />
    </Card>
  );
}
