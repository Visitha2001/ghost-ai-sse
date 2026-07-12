import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { checkProjectAccess } from "@/lib/project-access";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId } = await params;

    // Verify project access
    const { hasAccess } = await checkProjectAccess(projectId);
    if (!hasAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const specs = await prisma.projectSpec.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(specs);
  } catch (error) {
    console.error("[SPECS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
