import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { liveblocks, getUserColor } from "@/lib/liveblocks";
import { checkProjectAccess } from "@/lib/project-access";

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { room } = await request.json();
  if (!room) {
    return new NextResponse("Missing room parameter", { status: 400 });
  }

  const { hasAccess } = await checkProjectAccess(room);
  if (!hasAccess) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Ensure the Liveblocks room exists
  try {
    await liveblocks.getRoom(room);
  } catch (err: unknown) {
    const error = err as { status?: number };
    if (error.status === 404) {
      await liveblocks.createRoom(room, {
        defaultAccesses: [], // Access is managed via session tokens
      });
    } else {
      throw err;
    }
  }

  // Create a session for the current user
  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name: user.fullName || user.username || "Anonymous",
      avatar: user.imageUrl,
      color: getUserColor(user.id),
    },
  });

  // Give the user access to this specific room
  session.allow(room, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new NextResponse(body, { status });
}
