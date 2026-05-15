import { createClient } from "@libsql/client";
import { schemaStatements } from "./schema";

let schemaReady: Promise<void> | null = null;

export function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error("Turso is not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.");
  }

  return createClient({ url, authToken });
}

export async function ensureSchema() {
  schemaReady ??= (async () => {
    const db = getDb();
    for (const statement of schemaStatements) {
      await db.execute(statement);
    }
  })();

  return schemaReady;
}
