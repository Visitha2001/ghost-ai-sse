import { task } from "@trigger.dev/sdk";

export const designTask = task({
  id: "design-agent-task",
  run: async (payload: { prompt: string; roomId: string }) => {
    console.log(`Design agent triggered for room ${payload.roomId} with prompt: ${payload.prompt}`);
    return { status: "received", prompt: payload.prompt, roomId: payload.roomId };
  },
});
