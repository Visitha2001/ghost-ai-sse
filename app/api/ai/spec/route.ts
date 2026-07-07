import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { tasks } from "@trigger.dev/sdk";
import { prisma } from "@/lib/prisma";
import { checkProjectAccess } from "@/lib/project-access";
import type { generateSpecTask } from "@/trigger/generate-spec";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { roomId, chatHistory, nodes, edges } = await req.json();

    if (!roomId) {
      return new NextResponse("Missing roomId", { status: 400 });
    }

    // Resolve project access from roomId
    const { hasAccess } = await checkProjectAccess(roomId);
    if (!hasAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Since we validated access, roomId acts as our projectId
    const projectId = roomId;

    // Trigger the task
    const handle = await tasks.trigger<typeof generateSpecTask>("generate-spec-task", {
      projectId,
      roomId,
      chatHistory: chatHistory || [],
      nodes: nodes || [],
      edges: edges || [],
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
    console.error("[SPEC_AGENT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
