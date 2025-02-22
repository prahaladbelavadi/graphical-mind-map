"use client";

import { Edge, Handle, Node, NodeProps, Position } from "@xyflow/react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { nodeSchema } from "@/types/schema";
import { generateId } from "ai";
import useStore from "@/store/node-store";
import { AppNode } from "@/store/types";

export type DecisionNodeData = Node<{
  question: string;
  options: string[];
}>;

export function DecisionNode({
  id,
  data,
  isConnectable,
}: NodeProps<DecisionNodeData>) {
  const { setNodes, setEdges } = useStore();
  const [question, setQuestion] = useState(data.question);
  const [options, setOptions] = useState(data.options);
  const [option, setOption] = useState("");
  const { submit, isLoading, error, object } = useObject({
    id,
    api: "/api/ai",
    schema: nodeSchema,
    onFinish: ({ object }) => {
      const newNodes: AppNode[] = [];
      const newEdges: Edge[] = [];
      console.log(object);
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
      setNodes(newNodes);
      setEdges(newEdges);
    },
  });
  // Streamed object
  // useEffect(() => {
  //   if (object) {
  //     console.log(object);
  //   }
  // }, [object]);
  const handleSubmit = (option: string) => {
    setOption(option);
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
  return (
    <Card className="w-300px w-[300px]">
      <CardHeader>
        <CardTitle>{question}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 p-2">
        {options.map((option) => (
          <Button key={option} onClick={() => handleSubmit(option)}>
            {option}
          </Button>
        ))}
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
