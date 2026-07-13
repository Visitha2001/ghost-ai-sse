import { task, metadata } from "@trigger.dev/sdk";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

const generateSpecSchema = z.object({
  projectId: z.string(),
  roomId: z.string(),
  chatHistory: z.array(z.any()), // You could make this more strict if needed
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
});

export const generateSpecTask = task({
  id: "generate-spec-task",
  maxDuration: 180, // 3 minutes max
  run: async (payload: any) => {
    // Validate input payload
    const parsedPayload = generateSpecSchema.safeParse(payload);
    
    if (!parsedPayload.success) {
      throw new Error(`Invalid payload: ${parsedPayload.error.message}`);
    }

    const { projectId, roomId, chatHistory } = parsedPayload.data;
    
    console.log(`Generate Spec task triggered for room ${roomId}`);

    metadata
      .set("status", "analyzing")
      .set("message", "Analyzing canvas and chat history...");

    try {
      const document = await liveblocks.getStorageDocument(roomId, "json");
      const currentState = JSON.stringify(document);
      const currentChat = JSON.stringify(chatHistory);

      metadata
        .set("status", "generating")
        .set("message", "Generating technical specification...");

      // Call AI to generate Markdown
      const { text } = await generateText({
        model: google("gemini-2.5-flash"), // Using flash for free tier availability
        system: `You are an expert AI Architect. Your job is to create a detailed, highly readable technical specification in Markdown format.
You are given the current state of a system diagram (nodes and edges in JSON) and the chat history of the room.
The spec should include:
- An Executive Summary
- System Architecture Overview
- Component Breakdown (derived from nodes)
- Data Flow / Interactions (derived from edges)
- Context & Considerations (derived from chat history)

Use Markdown formatting properly with headings, lists, bold text, and code blocks where appropriate. Do NOT wrap the entire output in a markdown code block (no \`\`\`markdown at the start/end). Just return the plain Markdown text.`,
        prompt: `Canvas state:\n${currentState}\n\nChat history:\n${currentChat}`,
      });

      console.log(`Generated spec of length ${text.length}`);

      metadata
        .set("message", "Saving specification...");

      const blob = await put(`specs/${projectId}/spec-${Date.now()}.md`, text, {
        access: "private",
        contentType: "text/markdown",
      });

      const spec = await prisma.projectSpec.create({
        data: {
          projectId,
          filePath: blob.url,
        },
      });

      metadata
        .set("status", "completed")
        .set("message", "Specification generated successfully.");

      return { markdown: text, specId: spec.id, url: blob.url };
    } catch (err) {
      console.error("Spec generation failed:", err);
      metadata
        .set("status", "failed")
        .set("message", "Failed to generate specification.");
      throw err;
    }
  },
});
