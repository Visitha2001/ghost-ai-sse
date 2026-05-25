import { Liveblocks } from "@liveblocks/node";

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined;
};

export const liveblocks =
  globalForLiveblocks.liveblocks ??
  new Liveblocks({ secret: process.env.LIVEBLOCKS_SECRET_KEY || "sk_dev_dummy" });

if (process.env.NODE_ENV !== "production") {
  globalForLiveblocks.liveblocks = liveblocks;
}

const COLORS = [
  "#E57373", "#F06292", "#BA68C8", "#9575CD", "#7986CB", "#64B5F6",
  "#4FC3F7", "#4DD0E1", "#4DB6AC", "#81C784", "#AED581", "#FF8A65",
  "#D4E157", "#FFD54F", "#FFB74D", "#A1887F", "#90A4AE",
];

export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}
