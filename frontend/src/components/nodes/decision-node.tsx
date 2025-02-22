"use client";

import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { nodeSchema } from "@/types/schema";
import { generateId } from "ai";
// import { CheckIcon, XIcon } from "@heroicons/react/outline";
export type DecisionNodeData = Node<{
  question: string;
  options: string[];
}>;

export function DecisionNode({
  id,
  data,
  isConnectable,
}: NodeProps<DecisionNodeData>) {
<<<<<<< Updated upstream
  const [question, setQuestion] = useState(data.question);
  const [options, setOptions] = useState(data.options);
=======
  const [prompt, setPrompt] = useState(data.prompt);
  //   don't bring it in from parent component, this is user feedback
>>>>>>> Stashed changes
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
    submit({ question, options, option });
  };
  return (
    <Card className="w-[300px]">
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
