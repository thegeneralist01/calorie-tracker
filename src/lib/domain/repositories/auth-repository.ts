import type { GoalType, Locale, ProfileSnapshot } from '../types';

export type NewUserInput = {
  username: string;
  email: string;
  passwordHash: string;
  locale: Locale;
  goalType: GoalType;
};

export type NewSessionInput = {
  userId: string;
  tokenHash: string;
  rememberDevice: boolean;
  expiresAt: Date;
};

export interface AuthRepository {
  findUserByEmail(email: string): Promise<ProfileSnapshot | null>;
  findUserByUsername(username: string): Promise<ProfileSnapshot | null>;
  findAuthUserByEmail(email: string): Promise<(ProfileSnapshot & { passwordHash: string }) | null>;
  createUser(input: NewUserInput): Promise<ProfileSnapshot>;
  createSession(input: NewSessionInput): Promise<void>;
  findSession(tokenHash: string): Promise<(ProfileSnapshot & { sessionId: string; expiresAt: Date; recentAuthAt: Date }) | null>;
  updateSessionActivity(sessionId: string): Promise<void>;
  deleteSession(tokenHash: string): Promise<void>;
  scheduleUserDeletion(userId: string, scheduledDeletionAt: Date): Promise<void>;
  undoUserDeletion(userId: string): Promise<void>;
}
