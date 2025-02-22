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

// made to display code generated by ChatGPT.

export type CodeNode = Node<{
  explanation: string;
  //   prompt: string;
  code: string;
}>;

export function CodeNode({ id, data, isConnectable }: NodeProps<CodeNode>) {
  const [prompt, setPrompt] = useState(data.explanation);
  //   const [option, setOption] = useState("");
  //   code comes in from ChatGPT
  const [code, setCode] = useState(data.code); // string []

  //   if <code> doesn't do well with streaming data, could use loading screen while code completes.
  const [loading, setLoading] = useState(true);
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
  const handleSubmit = () => {
    // setCode(code);
    // submit({ prompt });
  };
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-2">
        <pre>
          <code>{code}</code>
        </pre>
      </CardContent>
      <Handle type="source" position={Position.Top} />
      <Handle type="target" position={Position.Bottom} />
    </Card>
  );
}
