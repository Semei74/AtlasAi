import type { Session } from "./session.interface.js";

export const SESSION_STORE = "SESSION_STORE";

export interface SessionStore {
  save(session: Session): Promise<void>;
  findById(id: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  updateLastActivity(id: string, timestamp: Date): Promise<void>;
  revoke(id: string): Promise<void>;
  revokeAllByUserId(userId: string, exceptId?: string): Promise<void>;
  deleteExpired(before: Date): Promise<number>;
}
