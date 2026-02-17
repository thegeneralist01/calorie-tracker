/// <reference types="astro/client" />

type SessionLocals = {
  id: string;
  userId: string;
  expiresAt: Date;
  recentAuthAt: Date;
};

type UserLocals = {
  id: string;
  username: string;
  email: string;
  locale: string;
  isAdmin: boolean;
};

declare namespace App {
  interface Locals {
    session: SessionLocals | null;
    user: UserLocals | null;
    locale: 'en' | 'de';
  }
}

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly DATABASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
