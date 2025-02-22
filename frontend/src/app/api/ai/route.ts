import { openai } from '@ai-sdk/openai';
import { Message, streamObject } from 'ai';
import { nodeSchema } from '@/types/schema';

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  const context = await req.json();
  const systemPrompt = `
  You are a helpful assistant that generates nodes for a flow.
  You must return an object with a 'nodes' array containing task nodes.
  Each task node must have:
  - type: "task"
  - data: { name: string, description: string, difficulty: "easy" | "medium" | "hard" }
  `;
  
  const result = await streamObject({
    model: openai('o3-mini-2025-01-31'),
    schema: nodeSchema,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      { role: "user", content: context.prompt },
    ],
  });

  return result.toTextStreamResponse();
}