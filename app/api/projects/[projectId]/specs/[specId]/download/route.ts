import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { checkProjectAccess } from "@/lib/project-access";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string; specId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId, specId } = await params;

    // Verify project access
    const { hasAccess } = await checkProjectAccess(projectId);
    if (!hasAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Find the spec
    const spec = await prisma.projectSpec.findUnique({
      where: {
        id: specId,
      },
    });

    if (!spec || spec.projectId !== projectId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Fetch the file from Vercel Blob
    const response = await fetch(spec.filePath, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
      }
    });
    if (!response.ok) {
      console.error(`Failed to fetch blob from ${spec.filePath}`);
      return new NextResponse("Failed to retrieve file", { status: 500 });
    }

    const fileBuffer = await response.arrayBuffer();

    // Return it as a downloadable file
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="system-spec.md"`,
      },
    });
  } catch (error) {
    console.error("[SPEC_DOWNLOAD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
