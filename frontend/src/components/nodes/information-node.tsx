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

export type InformationNode = Node<{
  content: string;
  references: string[];
  tags: string[];
}>;

export function InformationNode({
  id,
  data,
  isConnectable,
}: NodeProps<InformationNode>) {
  const { setNodes, setEdges, nodes, edges } = useStore();
  const [content, setContent] = useState(data.content);
  const [references, setReferences] = useState(data.references);
  const [tags, setTags] = useState(data.tags);
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
      setEdges([...edges, ...newEdges]);
      setNodes([...nodes, ...newNodes]);
    },
  });
  // Streamed object
  // useEffect(() => {
  //   if (object) {
  //     console.log(object);
  //   }
  // }, [object]);
  const handleSubmit = () => {
    // setOption(option);
    // const contextNodes = useStore
    //   .getState()
    //   .nodes.filter((node) => !node.id.startsWith(`${id}-`))
    //   .map(({ type, data, id }) => ({
    //     id,
    //     type,
    //     data,
    //   }));
    // const contextEdges = useStore
    //   .getState()
    //   .edges.filter((edge) => !edge.target.startsWith(`${id}-`))
    //   .map(({ id, source, target }) => ({
    //     id,
    //     source,
    //     target,
    //   }));
    // submit({
    //   messages: [
    //     {
    //       role: "user",
    //       content: `Selected option: "${option}" for the question: "${question}"`,
    //     },
    //   ],
    //   nodeTree: contextNodes,
    //   edgeTree: contextEdges,
    //   currentNodeId: id,
    //   currentNodeType: "decision",
    // });
  };
  return (
    //     content: string;
    //   references: string[];
    //   tags: string[];

    <Card className="w-[300px]">
      <CardContent className="flex flex-col gap-2 p-2">
        <h3>Content</h3>
        <p>{content}</p>
        <h3>References</h3>
        <ul>
          {references.map((ref, index) => (
            <li key={index}>{ref}</li>
          ))}
        </ul>

        <p>Tags</p>
        <ul>
          {tags.map((tag, index) => (
            <li key={index}>{tag}</li>
          ))}
        </ul>
        <ul></ul>
      </CardContent>
      <Handle type="source" position={Position.Top} />
      <Handle type="target" position={Position.Bottom} />
    </Card>
  );
}
