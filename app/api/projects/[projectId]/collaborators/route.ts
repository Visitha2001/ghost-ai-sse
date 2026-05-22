import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkProjectAccess } from '@/lib/project-access';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { projectId } = await params;
    
    // Enforce project access boundary
    const { hasAccess, project } = await checkProjectAccess(projectId);
    if (!hasAccess || !project) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Retrieve database collaborators
    const collaborators = await prisma.projectCollaborator.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    const client = await clerkClient();

    // Enrich Owner Details from Clerk
    let ownerInfo: {
      id: string;
      email: string;
      name: string;
      imageUrl: string | null;
      isOwner: boolean;
    } = {
      id: project.ownerId,
      email: 'Owner',
      name: 'Owner',
      imageUrl: null,
      isOwner: true,
    };

    try {
      const owner = await client.users.getUser(project.ownerId);
      ownerInfo = {
        id: project.ownerId,
        email: owner.emailAddresses.find((e) => e.id === owner.primaryEmailAddressId)?.emailAddress || 'Owner',
        name: [owner.firstName, owner.lastName].filter(Boolean).join(' ') || owner.username || 'Project Owner',
        imageUrl: owner.imageUrl || null,
        isOwner: true,
      };
    } catch (e) {
      console.error('[OWNER_ENRICH_ERROR]', e);
    }

    // Enrich Collaborator Details from Clerk
    let enrichedCollaborators: any[] = [];
    if (collaborators.length > 0) {
      try {
        const emails = collaborators.map((c) => c.email);
        const clerkUsers = await client.users.getUserList({
          emailAddress: emails,
          limit: 100,
        });

        enrichedCollaborators = collaborators.map((c) => {
          const user = clerkUsers.data.find((u) =>
            u.emailAddresses.some((e) => e.emailAddress.toLowerCase() === c.email.toLowerCase())
          );

          return {
            id: c.id,
            email: c.email,
            name: user ? ([user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || null) : null,
            imageUrl: user?.imageUrl || null,
            isOwner: false,
            createdAt: c.createdAt,
          };
        });
      } catch (e) {
        console.error('[COLLABORATORS_ENRICH_ERROR]', e);
        // Fallback: Use only local DB values if Clerk calls fail
        enrichedCollaborators = collaborators.map((c) => ({
          id: c.id,
          email: c.email,
          name: null,
          imageUrl: null,
          isOwner: false,
          createdAt: c.createdAt,
        }));
      }
    }

    return NextResponse.json({
      owner: ownerInfo,
      collaborators: enrichedCollaborators,
    });
  } catch (error) {
    console.error('[COLLABORATORS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { projectId } = await params;
    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return new NextResponse('Invalid email', { status: 400 });
    }

    // Enforce that only the project owner can invite collaborators
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return new NextResponse('Not found', { status: 404 });
    }

    if (project.ownerId !== userId) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Prevent owners from inviting themselves
    const client = await clerkClient();
    let isSelfInvite = false;
    try {
      const ownerUser = await client.users.getUser(userId);
      const ownerEmail = ownerUser.emailAddresses.find((e) => e.id === ownerUser.primaryEmailAddressId)?.emailAddress;
      if (ownerEmail && ownerEmail.toLowerCase() === email.trim().toLowerCase()) {
        isSelfInvite = true;
      }
    } catch (e) {
      console.error(e);
    }

    if (isSelfInvite) {
      return new NextResponse('You cannot invite yourself as a collaborator', { status: 400 });
    }

    try {
      const collaborator = await prisma.projectCollaborator.create({
        data: {
          projectId,
          email: email.trim().toLowerCase(),
        },
      });

      return NextResponse.json(collaborator);
    } catch (dbError: any) {
      // Handle Unique Constraint Violation (P2002)
      if (dbError.code === 'P2002') {
        return new NextResponse('Collaborator already exists', { status: 409 });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('[COLLABORATORS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { projectId } = await params;
    const { searchParams } = new URL(req.url);
    const collaboratorId = searchParams.get('id');

    if (!collaboratorId) {
      return new NextResponse('Collaborator ID is required', { status: 400 });
    }

    // Enforce that only the project owner can remove collaborators
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return new NextResponse('Not found', { status: 404 });
    }

    if (project.ownerId !== userId) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const deleted = await prisma.projectCollaborator.delete({
      where: {
        id: collaboratorId,
        projectId, // Double check scope
      },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error('[COLLABORATORS_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
