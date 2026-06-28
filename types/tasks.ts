import { z } from "zod";

export const AiStatusFeedPayloadSchema = z.object({
  text: z.string().optional(),
});

export type AiStatusFeedPayload = z.infer<typeof AiStatusFeedPayloadSchema>;

export const AiChatFeedPayloadSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  senderName: z.string().optional(),
  senderAvatar: z.string().optional(),
  content: z.string(),
  timestamp: z.number(),
  role: z.enum(["user", "assistant"]),
});

export type AiChatFeedPayload = z.infer<typeof AiChatFeedPayloadSchema>;
