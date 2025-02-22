import { z } from "zod";

// Base schema
export const baseNodeSchema = z.object({
  type: z.string(),
  data: z.record(z.any()),
});

// Error Node (explicit type)
const errorNodeSchema = baseNodeSchema.extend({
  type: z.literal("error"), // Literal match
  data: z.object({
    message: z.string(),
    details: z.string(),
  }),
});

// Valid Node Types
const validNodeSchema = z.discriminatedUnion("type", [
  baseNodeSchema.extend({
    type: z.literal("task"),
    data: z.object({
      name: z.string(),
      description: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]),
    }),
  }),
  // baseNodeSchema.extend({
  //   type: z.literal("decision"),
  //   data: z.object({
  //     question: z.string(),
  //     options: z.array(z.string()),
  //   }),
  // }),
  // baseNodeSchema.extend({
  //   type: z.literal("conversational"),
  //   data: z.object({
  //     content: z.string(),
  //   }),
  // }),
]);

// Unified Schema
export const nodeSchema = z
  .object({
    nodes: z.array(
      z.union([
        validNodeSchema,
        errorNodeSchema, // Separate error type
      ]),
    ),
  })
  .superRefine((val, ctx) => {
    val.nodes.forEach((node, index) => {
      if (!["task",  "error"].includes(node.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid node type '${node.type}' at index ${index}`,
          path: ["nodes", index],
        });
      }
    });
  });
export type Node = z.infer<typeof nodeSchema>;
