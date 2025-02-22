"use client";

import { Handle, Node, NodeProps, Position, Edge } from "@xyflow/react";
import { Card, CardContent } from "../ui/card";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { nodeSchema } from "@/types/schema";
import { generateId } from "ai";
import useStore from "@/store/node-store";
import { AppNode } from "@/store/types";
export type TaskNodeData = Node<{
  name: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
}>;

export function TaskNode({ id, data, isConnectable }: NodeProps<TaskNodeData>) {
  const { nodes, edges, setNodes, setEdges } = useStore();

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

  return (
    <Card className="w-[300px]">
      <CardContent className="flex flex-col gap-2 p-2">
        <h3 className="text-lg font-bold">{data.name}</h3>
        <p className="text-sm text-gray-500">{data.description}</p>
        <p className="text-sm text-gray-500">{data.difficulty}</p>
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
