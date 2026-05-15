import { listAuditEvents, listDocuments, signDocument } from "@/lib/db/repository";
import type { Role, SignatureType } from "@/lib/dms-types";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: RouteContext<"/api/documents/[id]/signatures">) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    await signDocument(id, {
      signer: String(body.signer ?? ""),
      role: String(body.role ?? "QA Approver") as Role,
      meaning: String(body.meaning ?? "Approval") as SignatureType,
      reason: String(body.reason ?? ""),
    });
    const [documents, audit] = await Promise.all([listDocuments(), listAuditEvents()]);
    return Response.json({ documents, audit }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to sign document.",
      },
      { status: 400 },
    );
  }
}
