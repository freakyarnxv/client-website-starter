import { createClient } from "@libsql/client";

let client: ReturnType<typeof createClient> | undefined;
export function db() {
  if (!client) {
    const url = import.meta.env.TURSO_DATABASE_URL;
    if (!url) throw new Error("TURSO_DATABASE_URL is not configured");
    client = createClient({ url, authToken: import.meta.env.TURSO_AUTH_TOKEN });
  }
  return client;
}

export async function initDb() {
  await db().batch([
    `CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, price INTEGER NOT NULL, image TEXT NOT NULL, category TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, stripe_session TEXT UNIQUE NOT NULL, amount INTEGER NOT NULL, currency TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  ], "write");
}
