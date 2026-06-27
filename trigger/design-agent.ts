import { task, wait } from "@trigger.dev/sdk";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

const AGENT_ID = "ai-agent";

async function setPresence(roomId: string, status: string, ttl: number = 60) {
  try {
    const res = await fetch(`https://api.liveblocks.io/v2/rooms/${roomId}/presence`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.LIVEBLOCKS_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: AGENT_ID,
        data: { status, thinking: true, cursor: { x: 0, y: 0 } },
        userInfo: {
          name: "AI Architect",
          avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=ai-architect&backgroundColor=b6e3f4",
          color: "#0AC7B4", // Teal
        },
        ttl,
      }),
    });
    
    if (!res.ok) {
      console.error(`Failed to set presence: ${res.statusText}`);
    }
  } catch (err) {
    console.error("Presence error:", err);
  }
}

async function clearPresence(roomId: string) {
  try {
    await fetch(`https://api.liveblocks.io/v2/rooms/${roomId}/presence`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.LIVEBLOCKS_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: AGENT_ID,
        data: { status: "done", thinking: false, cursor: null },
        userInfo: {
          name: "AI Architect",
          avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=ai-architect&backgroundColor=b6e3f4",
          color: "#0AC7B4",
        },
        ttl: 2, // Expire quickly
      }),
    });
  } catch (err) {
    console.error("Presence error:", err);
  }
}

async function patchStorage(roomId: string, ops: any[]) {
  const res = await fetch(`https://api.liveblocks.io/v2/rooms/${roomId}/storage/json-patch`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${process.env.LIVEBLOCKS_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ops),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to patch storage: ${errText}`);
  }
}

const designSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    label: z.string(),
    shape: z.enum(["process", "decision", "terminator", "connector", "database", "preparation"]),
    color: z.enum(["neutral", "blue", "purple", "orange", "red", "pink", "green", "teal"]),
    width: z.number().default(160),
    height: z.number().default(80),
    x: z.number(),
    y: z.number()
  })),
  edges: z.array(z.object({
    id: z.string(),
    sourceNodeId: z.string(),
    targetNodeId: z.string(),
    label: z.string().optional()
  }))
});

export const designTask = task({
  id: "design-agent-task",
  maxDuration: 120, // 2 minutes max
  run: async (payload: { prompt: string; roomId: string }) => {
    const { roomId, prompt } = payload;
    
    console.log(`Design agent triggered for room ${roomId} with prompt: ${prompt}`);
    
    // 1. Initial presence
    await setPresence(roomId, "Analyzing request...", 120);

    try {
      // 2. Fetch current canvas state to give context
      const document = await liveblocks.getStorageDocument(roomId, "json");
      const currentState = JSON.stringify(document);

      await setPresence(roomId, "Generating design...", 120);

      // 3. Call AI
      const { object } = await generateObject({
        model: google("gemini-2.5-flash"), // or 2.5-pro if available
        system: `You are an expert AI Architect mapping out software systems into diagrams.
You are given the current state of a React Flow canvas as JSON, and a user prompt.
You must return the new nodes and edges to ADD to the diagram to fulfill the prompt.
If the prompt asks to create a completely new system, create a full set of nodes and edges.
Layout rules:
- Arrange nodes from left to right or top to bottom.
- Space nodes reasonably (e.g. x offset 250, y offset 150).
Colors: neutral, blue, purple, orange, red, pink, green, teal. Use them semantically (e.g., blue for frontend, green for database, orange for queues).
Shapes: process, decision, terminator, connector, database, preparation.
Provide unique IDs for the nodes (e.g. 'node-api-123') and edges (e.g. 'edge-api-db-456').`,
        prompt: `Current canvas state:\n${currentState}\n\nUser request:\n${prompt}`,
        schema: designSchema
      });

      console.log(`Generated ${object.nodes.length} nodes and ${object.edges.length} edges.`);

      await setPresence(roomId, "Applying changes to canvas...", 60);

      // 4. Construct JSON Patch
      const ops = [];

      // Add nodes
      for (const node of object.nodes) {
        ops.push({
          op: "add",
          path: `/flow/nodes/${node.id}`,
          value: {
            id: node.id,
            type: "custom",
            position: { x: node.x, y: node.y },
            data: { label: node.label, color: node.color, shape: node.shape },
            style: { width: node.width, height: node.height }
          }
        });
      }

      // Add edges
      for (const edge of object.edges) {
        ops.push({
          op: "add",
          path: `/flow/edges/${edge.id}`,
          value: {
            id: edge.id,
            type: "custom",
            source: edge.sourceNodeId,
            sourceHandle: "bottom", // default
            target: edge.targetNodeId,
            targetHandle: "top", // default
            data: { path: "step", arrow: "forward", label: edge.label || "" }
          }
        });
      }

      // 5. Apply Patch
      if (ops.length > 0) {
        await patchStorage(roomId, ops);
      }

      // 6. Clear presence
      await clearPresence(roomId);

      return { status: "success", generatedNodes: object.nodes.length, generatedEdges: object.edges.length };

    } catch (err) {
      console.error("Design agent failed:", err);
      await setPresence(roomId, "Generation failed", 5);
      await clearPresence(roomId);
      throw err;
    }
  },
});
