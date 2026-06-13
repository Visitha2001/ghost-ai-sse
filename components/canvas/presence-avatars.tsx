"use client"

import { useOthers } from "@liveblocks/react/suspense"
import { UserButton } from "@clerk/nextjs"

const MAX_VISIBLE = 5

export function PresenceAvatars() {
  const others = useOthers()

  const visibleOthers = others.slice(0, MAX_VISIBLE)
  const overflowCount = others.length - MAX_VISIBLE

  return (
    <div className="absolute top-4 right-4 z-30 flex items-center gap-0">
      {/* Collaborator avatar stack */}
      {others.length > 0 && (
        <>
          <div className="flex items-center -space-x-2">
            {visibleOthers.map(({ connectionId, info }) => (
              <CollaboratorAvatar
                key={connectionId}
                name={info.name}
                avatar={info.avatar}
                color={info.color}
              />
            ))}
            {overflowCount > 0 && (
              <div
                className="relative flex h-8 w-8 items-center justify-center rounded-full bg-elevated border-2 border-base text-[11px] font-semibold text-copy-secondary select-none"
                title={`${overflowCount} more collaborator${overflowCount > 1 ? "s" : ""}`}
              >
                +{overflowCount}
              </div>
            )}
          </div>

          {/* Divider */}
          <span className="h-6 w-[1px] bg-gradient-to-b from-transparent via-border to-transparent mx-3" />
        </>
      )}

      {/* Current user — Clerk UserButton */}
      <div className="flex h-8 w-8 items-center justify-center">
        <UserButton />
      </div>
    </div>
  )
}

/* ── Collaborator avatar (display-only) ─────────────────────────── */

function CollaboratorAvatar({
  name,
  avatar,
  color,
}: {
  name: string
  avatar: string
  color: string
}) {
  const initials = getInitials(name)

  return (
    <div
      className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-base select-none"
      style={{ boxShadow: `0 0 0 2px ${color}40` }}
      title={name}
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatar}
          alt={name}
          className="h-full w-full rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
      )}
    </div>
  )
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return (parts[0]?.[0] ?? "?").toUpperCase()
}
