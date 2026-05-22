import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export interface ClerkIdentity {
  userId: string | null;
  primaryEmail: string | null;
}

/**
 * Retrieves the current authenticated Clerk user's ID and primary email address.
 */
export async function getClerkIdentity(): Promise<ClerkIdentity> {
  const { userId } = await auth()
  if (!userId) {
    return { userId: null, primaryEmail: null }
  }
  const user = await currentUser()
  const primaryEmail = user?.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress ?? null

  return { userId, primaryEmail }
}

/**
 * Validates whether the current authenticated user has access to the specified project.
 * Access is granted if the user is the project owner or listed as a collaborator.
 */
export async function checkProjectAccess(projectId: string) {
  const { userId, primaryEmail } = await getClerkIdentity()
  if (!userId) {
    return { hasAccess: false, project: null }
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    return { hasAccess: false, project: null }
  }

  // Owner check
  if (project.ownerId === userId) {
    return { hasAccess: true, project }
  }

  // Collaborator check
  if (primaryEmail) {
    const collaborator = await prisma.projectCollaborator.findUnique({
      where: {
        projectId_email: {
          projectId,
          email: primaryEmail,
        },
      },
    })
    if (collaborator) {
      return { hasAccess: true, project }
    }
  }

  return { hasAccess: false, project: null }
}
