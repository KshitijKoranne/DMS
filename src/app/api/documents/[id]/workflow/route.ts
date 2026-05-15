import { advanceDocument, listAuditEvents, listDocuments } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export async function PATCH(_request: Request, context: RouteContext<"/api/documents/[id]/workflow">) {
  try {
    const { id } = await context.params;
    await advanceDocument(id);
    const [documents, audit] = await Promise.all([listDocuments(), listAuditEvents()]);
    return Response.json({ documents, audit });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to advance workflow.",
      },
      { status: 400 },
    );
  }
}
