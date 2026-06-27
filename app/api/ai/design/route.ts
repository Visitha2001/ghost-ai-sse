import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { tasks } from "@trigger.dev/sdk";
import { prisma } from "@/lib/prisma";
import type { designTask } from "@/trigger/design-agent";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { prompt, roomId, projectId } = await req.json();

    if (!prompt || !roomId || !projectId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Trigger the task
    const handle = await tasks.trigger<typeof designTask>("design-agent-task", {
      prompt,
      roomId,
    });

    // Create a record of the run
    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId,
        userId,
      },
    });

    return NextResponse.json({ runId: handle.id });
  } catch (error) {
    console.error("[DESIGN_AGENT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
