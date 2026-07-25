import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type * as schema from './db/schema';
import type { Role } from '@shared/types';

export interface Env {
  DB: D1Database;
  SCREENSHOTS: R2Bucket;
  BACKUPS: R2Bucket;
  JWT_SECRET: string;
  INGEST_TOKEN: string;
  APP_NAME: string;
  ASSETS?: Fetcher;
}

export interface AuthContext {
  userId: string;
  role: Role;
  organisationId: string;
}

// Hono context variables
export type Variables = {
  db: DrizzleD1Database<typeof schema>;
  auth: AuthContext;
};

export type AppEnv = { Bindings: Env; Variables: Variables };
