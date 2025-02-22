import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { nodeSchema } from '@/types/schema';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const context = await req.json();

  const result = streamObject({
    model: openai('gpt-4o-mini'),
    schema: nodeSchema,
    prompt:
      `Generate 3 tasks for a messages app in this context:` + context,
  });

  return result.toTextStreamResponse();
}