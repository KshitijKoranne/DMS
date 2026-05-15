import { ensureSchema } from "../../src/lib/db/client";

async function main() {
  await ensureSchema();
  console.log("Database schema is ready.");
}

void main();
