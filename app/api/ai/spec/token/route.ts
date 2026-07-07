import { NextResponse } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { auth as triggerAuth } from "@trigger.dev/sdk";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await clerkAuth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { runId } = await req.json();

    if (!runId) {
      return new NextResponse("Missing runId", { status: 400 });
    }

    // Verify ownership
    const taskRun = await prisma.taskRun.findUnique({
      where: {
        runId,
      },
    });

    if (!taskRun || taskRun.userId !== userId) {
      return new NextResponse("Unauthorized or run not found", { status: 401 });
    }

    // Generate Trigger.dev public token scoped to this run
    const publicToken = await triggerAuth.createPublicToken({
      scopes: {
        read: {
          runs: [runId],
          tasks: ["generate-spec-task"],
        },
      },
      expirationTime: "1h", // Scope for 1 hour as per spec
    });

    return NextResponse.json({ token: publicToken });
  } catch (error) {
    console.error("[SPEC_TOKEN_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
