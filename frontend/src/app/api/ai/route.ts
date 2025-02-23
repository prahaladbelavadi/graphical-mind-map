import { nodeSchema } from "@/types/schema";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";

export const maxDuration = 30;

interface RequestBody {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  nodeTree: Array<{
    id: string;
    type: string;
    data: Record<string, unknown>;
  }>;
  edgeTree: Array<{
    id: string;
    source: string;
    target: string;
  }>;
  currentNodeId: string;
  currentNodeType: string;
}

export async function POST(req: Request) {
  const { messages, nodeTree, edgeTree, currentNodeId, currentNodeType } =
    (await req.json()) as RequestBody;

  const systemPrompt = `
  You are a Graph empowered LLM. Analyze this node tree and user input:
  CURRENT NODE TREE (${nodeTree.length} nodes):
  ${nodeTree.map((n) => `- ${n.type}: ${JSON.stringify(n.data)}`).join("\n")}

  CURRENT EDGE TREE (${edgeTree.length} edges):
  ${edgeTree.map((e) => `- ${e.source} -> ${e.target}`).join("\n")}

  CURRENT NODE (${currentNodeId}):
  ${currentNodeType}: ${JSON.stringify(nodeTree.find((n) => n.id === currentNodeId)?.data)}

  RESPONSE RULES:
  1. Maintain logical workflow continuity
  2. Try to respond with at least 5 nodes, but try for more where possible.
  3. Only use appropriate node types for the given request.
  `;

  const result = streamObject({
    model: openai("o3-mini-2025-01-31"),
    schema: nodeSchema,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature: 0.4,
  });

  return result.toTextStreamResponse();
}
