import {
  createDocument,
  listAuditEvents,
  listDocuments,
  seedDatabaseIfEmpty,
} from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedDatabaseIfEmpty();
    const [documents, audit] = await Promise.all([listDocuments(), listAuditEvents()]);
    return Response.json({ documents, audit });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to load documents.",
      },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await createDocument({
      title: String(body.title ?? ""),
      type: String(body.type ?? "SOP"),
      department: String(body.department ?? "Quality Assurance"),
      owner: String(body.owner ?? ""),
      risk: body.risk === "Low" || body.risk === "High" ? body.risk : "Medium",
    });
    const [documents, audit] = await Promise.all([listDocuments(), listAuditEvents()]);
    return Response.json({ documents, audit }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to create document.",
      },
      { status: 400 },
    );
  }
}
