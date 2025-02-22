"use client";

import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { nodeSchema } from "@/types/schema";
import { generateId } from "ai";
// import { CheckIcon, XIcon } from "@heroicons/react/outline";
export type DecisionNodeData = Node<{
  prompt: string;
  option: string;
}>;

export function DecisionNode({
  id,
  data,
  isConnectable,
}: NodeProps<DecisionNodeData>) {
  const [prompt, setPrompt] = useState(data.prompt);
  const [option, setOption] = useState("");
  const { submit, isLoading, error, object } = useObject({
    id,
    api: "/api/ai",
    schema: nodeSchema,
    onFinish: ({ object }) => {
      console.log(object);
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
        });
      }
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
    submit({ prompt });
  };
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-2">
        {/* <Input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        /> */}
        {/* <Button onClick={handleSubmit}>Generate</Button> */}
        <Button onClick={() => handleSubmit("YES")}>Yes</Button>
        <Button onClick={() => handleSubmit("NO")}>No</Button>
      </CardContent>
      <Handle type="source" position={Position.Top} />
      <Handle type="target" position={Position.Bottom} />
    </Card>
  );
}
