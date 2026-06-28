import { AiStatusFeedPayload, AiChatFeedPayload } from "./types/tasks";

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking?: boolean;
    };
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };
    RoomEvent: 
      | { type: "ai-status-feed"; payload: AiStatusFeedPayload }
      | { type: "ai-chat"; payload: AiChatFeedPayload };
  }
}

export {};
