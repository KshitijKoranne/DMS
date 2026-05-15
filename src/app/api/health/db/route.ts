import { ensureSchema } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    return Response.json({ ok: true, database: "turso" });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Database unavailable.",
      },
      { status: 503 },
    );
  }
}
