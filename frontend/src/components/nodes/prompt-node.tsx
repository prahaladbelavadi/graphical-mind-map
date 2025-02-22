'use client';

import { Handle, Node, NodeProps, Position,  } from '@xyflow/react';
import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
export type PromptNodeData = Node<{
  prompt: string;
}>
export function PromptNode({ data, isConnectable }: NodeProps<PromptNodeData>) {
    const [prompt, setPrompt] = useState(data.prompt);
  return <Card className='bg-white rounded-md p-2'>
<CardContent>
    <Input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
    </CardContent>

    <Handle type="source" position={Position.Top} />
    <Handle type="target" position={Position.Bottom} />
  </Card>;
}
