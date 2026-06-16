"use client"

import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react"
import { ReactFlowProvider } from '@xyflow/react'
import { CanvasFlow } from "./canvas-flow"

import { ErrorBoundary } from "./error-boundary"
import { Loader2, AlertTriangle } from "lucide-react"

export function CanvasWrapper({ roomId }: { roomId: string }) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth" badgeLocation="bottom-left">
      <ErrorBoundary fallback={
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <AlertTriangle className="h-8 w-8 text-destructive/80" />
          <p>Failed to connect to Liveblocks. Please try refreshing.</p>
        </div>
      }>
        <RoomProvider
          id={roomId}
          initialPresence={{
            cursor: null,
            isThinking: false,
          }}
        >
          <ClientSideSuspense fallback={
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <p>Loading collaborative canvas...</p>
            </div>
          }>
            <div className="relative h-full w-full">
              <ReactFlowProvider>
                <CanvasFlow />
              </ReactFlowProvider>
            </div>
          </ClientSideSuspense>
        </RoomProvider>
      </ErrorBoundary>
    </LiveblocksProvider>
  )
}
