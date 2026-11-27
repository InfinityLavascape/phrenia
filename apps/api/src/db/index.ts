import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

/** In-process Postgres for development and tests: nothing to install. Production uses a real Postgres. */
export async function createDevDb(dataDir?: string) {
  const client = new PGlite(dataDir);
  const db = drizzle(client, { schema });
  await client.exec(`
    create table if not exists projects (id text primary key, name text not null, created_at timestamptz not null default now());
    create table if not exists tasks (id text primary key, project_id text not null references projects(id), title text not null, plan jsonb not null default '{}'::jsonb);
  `);
  return { db, client };
}
export { schema };
