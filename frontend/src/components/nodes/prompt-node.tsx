'use client';

import { Handle, Node, NodeProps, Position,  } from '@xyflow/react';
import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
export type PromptNodeData = Node<{
  prompt: string;
}>
export function PromptNode({ data, isConnectable }: NodeProps<PromptNodeData>) {
    const [prompt, setPrompt] = useState(data.prompt);
  return <Card >
<CardContent className='flex flex-col gap-2 p-2'>
    <Input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
    <Button>Generate</Button>
    </CardContent>

    <Handle type="source" position={Position.Top} />
    <Handle type="target" position={Position.Bottom} />
  </Card>;
}
