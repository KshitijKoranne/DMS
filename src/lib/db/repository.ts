import type { Row } from "@libsql/client";
import type {
  AuditRecord,
  DocumentRecord,
  Role,
  SignatureRecord,
  SignatureType,
  Status,
  TrainingRecord,
} from "../dms-types";
import { auditSeed, departments, documentTypes, documentsSeed } from "../seed-data";
import { dmsUsers, roleDescriptions } from "../users";
import { ensureSchema, getDb } from "./client";
import { makeHash, makeId } from "./ids";

type NewDocumentInput = {
  title: string;
  type: string;
  department: string;
  owner: string;
  risk: DocumentRecord["risk"];
};

type SignatureInput = {
  signer: string;
  role: Role;
  meaning: SignatureType;
  reason: string;
};

const nextStatus: Record<Status, Status> = {
  Draft: "In Review",
  "In Review": "Approved",
  Approved: "Effective",
  Effective: "Under Revision",
  "Under Revision": "In Review",
  Retired: "Retired",
};

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function text(row: Row | undefined, key: string) {
  const value = row?.[key];
  return value == null ? "" : String(value);
}

function numberValue(row: Row | undefined, key: string) {
  return Number(row?.[key] ?? 0);
}

function documentTypeId(name: string) {
  return `type_${slug(name)}`;
}

function departmentId(name: string) {
  return `dept_${slug(name)}`;
}

function roleId(name: Role) {
  return `role_${slug(name)}`;
}

function userId(name: string) {
  return `user_${slug(name)}`;
}

async function execute(statement: string, args: Array<string | number | null> = []) {
  return getDb().execute({ sql: statement, args });
}

export async function ensureReferenceData() {
  await ensureSchema();

  for (const name of departments) {
    await execute("INSERT OR IGNORE INTO departments (id, name) VALUES (?, ?)", [
      departmentId(name),
      name,
    ]);
  }

  for (const name of documentTypes) {
    await execute(
      "INSERT OR IGNORE INTO document_types (id, name, default_retention, requires_training) VALUES (?, ?, ?, ?)",
      [documentTypeId(name), name, name === "BMR" ? "Batch expiry + 1 year" : "Policy driven", 0],
    );
  }

  for (const [name, description] of Object.entries(roleDescriptions) as Array<[Role, string]>) {
    await execute("INSERT OR IGNORE INTO roles (id, name, description) VALUES (?, ?, ?)", [
      roleId(name),
      name,
      description,
    ]);
  }

  for (const { id, name, email, role, department } of dmsUsers) {
    await execute(
      "INSERT OR IGNORE INTO users (id, name, email, role_id, department_id) VALUES (?, ?, ?, ?, ?)",
      [id, name, email, roleId(role), departmentId(department)],
    );
  }
}

export async function seedDatabase() {
  await ensureReferenceData();

  for (const document of documentsSeed) {
    await upsertDocument(document);
  }

  for (const event of auditSeed) {
    await execute(
      "INSERT OR IGNORE INTO audit_events (id, document_id, actor_user_id, action, note, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        event.id,
        event.documentId,
        userId(event.actor),
        event.action,
        event.note,
        "{}",
        event.time,
      ],
    );
  }
}

export async function seedDatabaseIfEmpty() {
  await ensureSchema();
  const result = await execute("SELECT COUNT(*) AS total FROM documents");
  if (numberValue(result.rows[0], "total") === 0) {
    await seedDatabase();
  }
}

async function upsertDocument(document: DocumentRecord) {
  await ensureUser(document.owner, "Document Owner", document.department);

  await execute(
    `INSERT OR IGNORE INTO documents (
      id, title, type_id, department_id, owner_user_id, status, risk,
      training_status, next_review_date, effective_date, retention_rule,
      storage_class, change_control
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      document.id,
      document.title,
      documentTypeId(document.type),
      departmentId(document.department),
      userId(document.owner),
      document.status,
      document.risk,
      document.training,
      document.nextReview === "Not set" ? null : document.nextReview,
      document.effectiveDate === "Not set" ? null : document.effectiveDate,
      document.retention,
      document.storage,
      document.changeControl,
    ],
  );

  const versionId = `${document.id}-REV-${document.revision}`;
  await execute(
    "INSERT OR IGNORE INTO document_versions (id, document_id, revision, title, created_by, version_note) VALUES (?, ?, ?, ?, ?, ?)",
    [versionId, document.id, document.revision, document.title, userId(document.owner), document.lastAction],
  );

  for (const tag of document.tags) {
    await execute("INSERT OR IGNORE INTO document_tags (document_id, tag) VALUES (?, ?)", [
      document.id,
      tag,
    ]);
  }

  for (const reviewer of document.reviewers) {
    await ensureUser(reviewer, "Technical Reviewer", document.department);
    await execute(
      "INSERT OR IGNORE INTO document_reviewers (document_id, user_id, reviewer_role) VALUES (?, ?, ?)",
      [document.id, userId(reviewer), "Reviewer"],
    );
  }

  for (const [index, meaning] of document.requiredSignatures.entries()) {
    await execute(
      "INSERT OR IGNORE INTO signature_requirements (document_id, meaning, required_role_id, sequence_no) VALUES (?, ?, ?, ?)",
      [document.id, meaning, roleId(meaning === "Review" ? "Technical Reviewer" : "QA Approver"), index + 1],
    );
  }

  for (const signature of document.signatures) {
    await ensureUser(signature.signer, signature.role, document.department);
    await execute(
      `INSERT OR IGNORE INTO signatures (
        id, document_id, version_id, signer_user_id, role_id, meaning, reason, signature_hash, signed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        signature.id,
        document.id,
        versionId,
        userId(signature.signer),
        roleId(signature.role),
        signature.meaning,
        signature.reason,
        signature.hash,
        signature.timestamp,
      ],
    );
  }

  for (const record of document.trainingRecords) {
    await execute(
      `INSERT OR IGNORE INTO training_assignments (
        id, document_id, training_group, assigned_count, completed_count, due_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `${document.id}-${slug(record.group)}`,
        document.id,
        record.group,
        record.assigned,
        record.complete,
        record.dueDate,
        record.complete >= record.assigned ? "Complete" : "Open",
      ],
    );
  }
}

export async function listDocuments() {
  await ensureSchema();

  const result = await execute(
    `SELECT
      d.id, d.title, d.status, d.risk, d.training_status, d.next_review_date,
      d.effective_date, d.retention_rule, d.storage_class, d.change_control,
      dt.name AS type_name, dep.name AS department_name, owner.name AS owner_name,
      COALESCE(v.revision, '01') AS revision, COALESCE(v.version_note, '') AS last_action
    FROM documents d
    JOIN document_types dt ON dt.id = d.type_id
    JOIN departments dep ON dep.id = d.department_id
    JOIN users owner ON owner.id = d.owner_user_id
    LEFT JOIN document_versions v ON v.document_id = d.id
      AND v.created_at = (
        SELECT MAX(created_at) FROM document_versions latest WHERE latest.document_id = d.id
      )
    ORDER BY d.updated_at DESC, d.id ASC`,
  );

  const records: DocumentRecord[] = [];
  const ids = result.rows.map((row) => text(row, "id"));
  const [tags, reviewers, requirements, signatures, training] = await Promise.all([
    listTagsForDocuments(ids),
    listReviewersForDocuments(ids),
    listRequirementsForDocuments(ids),
    listSignaturesForDocuments(ids),
    listTrainingForDocuments(ids),
  ]);

  for (const row of result.rows) {
    records.push(hydrateDocument(row, tags, reviewers, requirements, signatures, training));
  }

  return records;
}

function hydrateDocument(
  row: Row,
  tags: Map<string, string[]>,
  reviewers: Map<string, string[]>,
  requirements: Map<string, SignatureType[]>,
  signatures: Map<string, SignatureRecord[]>,
  trainingRecords: Map<string, TrainingRecord[]>,
): DocumentRecord {
  const documentId = text(row, "id");
  return {
    id: documentId,
    title: text(row, "title"),
    type: text(row, "type_name"),
    department: text(row, "department_name"),
    owner: text(row, "owner_name"),
    status: text(row, "status") as Status,
    revision: text(row, "revision"),
    effectiveDate: text(row, "effective_date") || "Not set",
    nextReview: text(row, "next_review_date") || "Not set",
    retention: text(row, "retention_rule"),
    risk: text(row, "risk") as DocumentRecord["risk"],
    training: text(row, "training_status") as DocumentRecord["training"],
    tags: tags.get(documentId) ?? [],
    reviewers: reviewers.get(documentId) ?? [],
    requiredSignatures: requirements.get(documentId) ?? [],
    signatures: signatures.get(documentId) ?? [],
    trainingRecords: trainingRecords.get(documentId) ?? [],
    changeControl: text(row, "change_control"),
    storage: text(row, "storage_class") as DocumentRecord["storage"],
    lastAction: text(row, "last_action") || "Updated",
  };
}

function placeholders(values: string[]) {
  return values.map(() => "?").join(", ");
}

function pushMapValue<T>(map: Map<string, T[]>, key: string, value: T) {
  map.set(key, [...(map.get(key) ?? []), value]);
}

async function listTagsForDocuments(documentIds: string[]) {
  const map = new Map<string, string[]>();
  if (documentIds.length === 0) return map;
  const result = await execute(
    `SELECT document_id, tag FROM document_tags WHERE document_id IN (${placeholders(documentIds)}) ORDER BY tag`,
    documentIds,
  );
  for (const row of result.rows) {
    pushMapValue(map, text(row, "document_id"), text(row, "tag"));
  }
  return map;
}

async function listReviewersForDocuments(documentIds: string[]) {
  const map = new Map<string, string[]>();
  if (documentIds.length === 0) return map;
  const result = await execute(
    `SELECT dr.document_id, u.name FROM document_reviewers dr
    JOIN users u ON u.id = dr.user_id
    WHERE dr.document_id IN (${placeholders(documentIds)})
    ORDER BY u.name`,
    documentIds,
  );
  for (const row of result.rows) {
    pushMapValue(map, text(row, "document_id"), text(row, "name"));
  }
  return map;
}

async function listRequirementsForDocuments(documentIds: string[]) {
  const map = new Map<string, SignatureType[]>();
  if (documentIds.length === 0) return map;
  const result = await execute(
    `SELECT document_id, meaning FROM signature_requirements
    WHERE document_id IN (${placeholders(documentIds)})
    ORDER BY sequence_no`,
    documentIds,
  );
  for (const row of result.rows) {
    pushMapValue(map, text(row, "document_id"), text(row, "meaning") as SignatureType);
  }
  return map;
}

async function listSignaturesForDocuments(documentIds: string[]) {
  const map = new Map<string, SignatureRecord[]>();
  if (documentIds.length === 0) return map;
  const result = await execute(
    `SELECT s.id, s.document_id, u.name AS signer, r.name AS role_name, s.meaning,
      s.reason, s.signature_hash, s.signed_at
    FROM signatures s
    JOIN users u ON u.id = s.signer_user_id
    JOIN roles r ON r.id = s.role_id
    WHERE s.document_id IN (${placeholders(documentIds)})
    ORDER BY s.signed_at ASC`,
    documentIds,
  );

  for (const row of result.rows) {
    pushMapValue(map, text(row, "document_id"), {
      id: text(row, "id"),
      documentId: text(row, "document_id"),
      signer: text(row, "signer"),
      role: text(row, "role_name") as Role,
      meaning: text(row, "meaning") as SignatureType,
      reason: text(row, "reason"),
      timestamp: text(row, "signed_at"),
      hash: text(row, "signature_hash"),
    });
  }
  return map;
}

async function listTrainingForDocuments(documentIds: string[]) {
  const map = new Map<string, TrainingRecord[]>();
  if (documentIds.length === 0) return map;
  const result = await execute(
    `SELECT document_id, training_group, assigned_count, completed_count, due_date
    FROM training_assignments
    WHERE document_id IN (${placeholders(documentIds)})
    ORDER BY due_date ASC`,
    documentIds,
  );

  for (const row of result.rows) {
    pushMapValue(map, text(row, "document_id"), {
      group: text(row, "training_group"),
      assigned: numberValue(row, "assigned_count"),
      complete: numberValue(row, "completed_count"),
      dueDate: text(row, "due_date"),
    });
  }
  return map;
}

export async function listAuditEvents() {
  await ensureSchema();
  const result = await execute(
    `SELECT a.id, a.document_id, COALESCE(u.name, 'System') AS actor_name,
      a.action, a.note, a.created_at
    FROM audit_events a
    LEFT JOIN users u ON u.id = a.actor_user_id
    ORDER BY a.created_at DESC, a.id DESC`,
  );

  return result.rows.map(
    (row): AuditRecord => ({
      id: text(row, "id"),
      documentId: text(row, "document_id"),
      actor: text(row, "actor_name"),
      action: text(row, "action"),
      note: text(row, "note"),
      time: text(row, "created_at"),
    }),
  );
}

export async function createDocument(input: NewDocumentInput) {
  await ensureReferenceData();

  const documentId = `${input.type.slice(0, 3).toUpperCase().replace(/\s/g, "")}-${makeId("DOC").slice(4)}`;
  const owner = input.owner.trim();
  await ensureUser(owner, "Document Owner", input.department);

  const document: DocumentRecord = {
    id: documentId,
    title: input.title.trim(),
    type: input.type,
    department: input.department,
    owner,
    status: "Draft",
    revision: "01",
    effectiveDate: "Not set",
    nextReview: "Not set",
    retention: "Policy driven",
    risk: input.risk,
    training: "Not required",
    tags: [input.type, input.department.split(" ")[0]],
    reviewers: ["QA Reviewer"],
    requiredSignatures: ["Review", "Approval"],
    signatures: [],
    trainingRecords: [],
    changeControl: `CC-2026-${makeId("CHG").slice(4)}`,
    storage: "Working draft",
    lastAction: "Draft created",
  };

  await upsertDocument(document);
  await addAudit("Document created", owner, document.id, `${document.id} added as ${document.type}.`);
  return document;
}

async function ensureUser(name: string, role: Role, department: string) {
  await execute(
    "INSERT OR IGNORE INTO users (id, name, email, role_id, department_id) VALUES (?, ?, ?, ?, ?)",
    [
      userId(name),
      name,
      `${slug(name)}@example.test`,
      roleId(role),
      departmentId(department),
    ],
  );
}

async function addAudit(action: string, actor: string, documentId: string, note: string) {
  await execute(
    "INSERT INTO audit_events (id, document_id, actor_user_id, action, note, metadata_json) VALUES (?, ?, ?, ?, ?, ?)",
    [makeId("AUD"), documentId, userId(actor), action, note, "{}"],
  );
}

export async function advanceDocument(documentId: string) {
  await ensureReferenceData();
  const result = await execute("SELECT status, owner_user_id FROM documents WHERE id = ?", [documentId]);
  const row = result.rows[0];
  if (!row) {
    throw new Error("Document not found.");
  }

  const currentStatus = text(row, "status") as Status;
  const targetStatus = nextStatus[currentStatus];
  if (targetStatus === currentStatus) {
    return;
  }

  await execute(
    `UPDATE documents
    SET status = ?, storage_class = ?, training_status = CASE
      WHEN ? = 'Effective' AND risk != 'Low' THEN 'Pending'
      ELSE training_status
    END, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [
      targetStatus,
      targetStatus === "Effective"
        ? "Controlled copy"
        : targetStatus === "Retired"
          ? "Archive"
          : targetStatus === "Draft"
            ? "Working draft"
            : "Controlled copy",
      targetStatus,
      documentId,
    ],
  );

  await execute(
    "INSERT INTO audit_events (id, document_id, actor_user_id, action, note, metadata_json) VALUES (?, ?, ?, ?, ?, ?)",
    [
      makeId("AUD"),
      documentId,
      text(row, "owner_user_id"),
      `Lifecycle moved to ${targetStatus}`,
      `${documentId} advanced from ${currentStatus} to ${targetStatus}.`,
      JSON.stringify({ from: currentStatus, to: targetStatus }),
    ],
  );
}

export async function signDocument(documentId: string, input: SignatureInput) {
  await ensureReferenceData();
  await ensureUser(input.signer, input.role, "Quality Assurance");

  const versionResult = await execute(
    "SELECT id FROM document_versions WHERE document_id = ? ORDER BY created_at DESC LIMIT 1",
    [documentId],
  );
  const versionId = text(versionResult.rows[0], "id");
  if (!versionId) {
    throw new Error("Document version not found.");
  }

  const existing = await execute(
    "SELECT id FROM signatures WHERE document_id = ? AND meaning = ? LIMIT 1",
    [documentId, input.meaning],
  );
  if (existing.rows[0]) {
    return;
  }

  const hash = makeHash(`${documentId}:${input.signer}:${input.meaning}:${input.reason}:${Date.now()}`);
  await execute(
    `INSERT INTO signatures (
      id, document_id, version_id, signer_user_id, role_id, meaning, reason, signature_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      makeId("SIG"),
      documentId,
      versionId,
      userId(input.signer),
      roleId(input.role),
      input.meaning,
      input.reason,
      hash,
    ],
  );

  if (input.meaning === "Approval") {
    await execute(
      "UPDATE documents SET status = CASE WHEN status = 'In Review' THEN 'Approved' ELSE status END, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [documentId],
    );
  }

  if (input.meaning === "Effective Release") {
    await execute(
      "UPDATE documents SET status = 'Effective', storage_class = 'Controlled copy', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [documentId],
    );
  }

  await addAudit(
    "E-signature captured",
    input.signer,
    documentId,
    `${input.meaning} completed as ${input.role}. Hash ${hash}.`,
  );
}
