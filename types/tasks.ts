import { z } from "zod";

export const AiStatusFeedPayloadSchema = z.object({
  text: z.string().optional(),
});

export type AiStatusFeedPayload = z.infer<typeof AiStatusFeedPayloadSchema>;
