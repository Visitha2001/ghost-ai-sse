import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { checkProjectAccess } from "@/lib/project-access"
import { put, get } from "@vercel/blob"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { projectId } = await params
    const { hasAccess, project } = await checkProjectAccess(projectId)

    if (!hasAccess || !project) {
      return new NextResponse("Not Found", { status: 404 })
    }

    if (!project.canvasBlobUrl) {
      return NextResponse.json({ nodes: [], edges: [] })
    }

    // Use blob get() with private access — it fetches the blob content directly
    const blobResult = await get(project.canvasBlobUrl, {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    if (!blobResult) {
      console.error("[CANVAS_GET] Blob not found for URL:", project.canvasBlobUrl)
      return NextResponse.json({ nodes: [], edges: [] })
    }

    // stream is available on statusCode 200; statusCode 304 returns null stream
    if (!blobResult.stream) {
      console.error("[CANVAS_GET] No stream returned for blob:", project.canvasBlobUrl)
      return NextResponse.json({ nodes: [], edges: [] })
    }

    const reader = blobResult.stream.getReader()
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    const totalLength = chunks.reduce((sum, c) => sum + c.length, 0)
    const merged = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      merged.set(chunk, offset)
      offset += chunk.length
    }
    const text = new TextDecoder().decode(merged)
    const canvasData = JSON.parse(text)
    return NextResponse.json(canvasData)
  } catch (error) {
    console.error("[CANVAS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { projectId } = await params
    const { hasAccess, project } = await checkProjectAccess(projectId)

    if (!hasAccess || !project) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const body = await req.json()

    // Upload to Vercel Blob using private access (required for private stores)
    const blob = await put(`projects/${projectId}/canvas.json`, JSON.stringify(body), {
      access: 'private',
      allowOverwrite: true,
      contentType: 'application/json',
    })

    // Update Prisma with the new blob URL
    await prisma.project.update({
      where: { id: projectId },
      data: { canvasBlobUrl: blob.url }
    })

    return NextResponse.json({ success: true, url: blob.url })
  } catch (error) {
    console.error("[CANVAS_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
