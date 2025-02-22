'use client';

import { Handle, Node, NodeProps, Position,  } from '@xyflow/react';
import { useState } from 'react';
export type PromptNodeData = Node<{
  prompt: string;
}>
export function PromptNode({ data, isConnectable }: NodeProps<PromptNodeData>) {
    const [prompt, setPrompt] = useState(data.prompt);
  return <div className='bg-white rounded-md p-2'>
    <div className='flex flex-col gap-2'>
<input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
    </div>
    <Handle type="source" position={Position.Top} />
    <Handle type="target" position={Position.Bottom} />
  </div>;
}
