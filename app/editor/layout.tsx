import * as React from "react"
import { EditorLayoutShell } from "@/components/editor/editor-layout-shell"
import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const primaryEmail = user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;

  const ownedProjectsData = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" }
  });

  const ownedProjects = ownedProjectsData.map(p => ({
    id: p.id,
    name: p.name,
    isOwned: true
  }));

  const sharedProjectsData = primaryEmail ? await prisma.projectCollaborator.findMany({
    where: { email: primaryEmail },
    include: { project: true },
    orderBy: { createdAt: "desc" }
  }) : [];

  const sharedProjects = sharedProjectsData.map(c => ({
    id: c.project.id,
    name: c.project.name,
    isOwned: false
  }));

  return (
    <EditorLayoutShell 
      ownedProjects={ownedProjects} 
      sharedProjects={sharedProjects}
    >
      {children}
    </EditorLayoutShell>
  )
}
