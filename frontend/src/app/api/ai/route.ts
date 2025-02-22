import { openai } from '@ai-sdk/openai';
import { Message, streamObject } from 'ai';
import { nodeSchema } from '@/types/schema';

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  const context = await req.json();
  const systemPrompt = `
  You are a helpful assistant that generates nodes for a flow.
  `
  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content:  context,
    },
  ] as Message[];
  const result = streamObject({
    model: openai('gpt-4o-mini'),
    schema: nodeSchema,
    messages,
  });

  return result.toTextStreamResponse();
}