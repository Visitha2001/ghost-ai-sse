## Error Type

Build Error

## Error Message

Export download doesn't exist in target module

## Build Output

./app/api/projects/[projectId]/canvas/route.ts:5:1
Export download doesn't exist in target module
3 | import { prisma } from "@/lib/prisma"
4 | import { checkProjectAccess } from "@/lib/project-access"

> 5 | import { put, download } from "@vercel/blob"

    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

6 |
7 | export async function GET(
8 | req: NextRequest,

The export download was not found in module [project]/node_modules/@vercel/blob/dist/index.js [app-route] (ecmascript).
Did you mean to import getDownloadUrl?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Next.js version: 16.2.4 (Turbopack)

-- i faces this same issue again
-- fix it
