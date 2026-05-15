export const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS document_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    default_retention TEXT NOT NULL,
    requires_training INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role_id TEXT NOT NULL,
    department_id TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
  )`,
  `CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type_id TEXT NOT NULL,
    department_id TEXT NOT NULL,
    owner_user_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Draft','In Review','Approved','Effective','Under Revision','Retired')),
    risk TEXT NOT NULL CHECK (risk IN ('Low','Medium','High')),
    training_status TEXT NOT NULL CHECK (training_status IN ('Not required','Pending','Complete')),
    next_review_date TEXT,
    effective_date TEXT,
    retention_rule TEXT NOT NULL,
    storage_class TEXT NOT NULL CHECK (storage_class IN ('Controlled copy','Working draft','Archive')),
    change_control TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES document_types(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS document_versions (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    revision TEXT NOT NULL,
    title TEXT NOT NULL,
    file_name TEXT,
    file_uri TEXT,
    checksum TEXT,
    version_note TEXT,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id, revision),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS document_tags (
    document_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    PRIMARY KEY (document_id, tag),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS document_reviewers (
    document_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    reviewer_role TEXT NOT NULL,
    PRIMARY KEY (document_id, user_id, reviewer_role),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS signature_requirements (
    document_id TEXT NOT NULL,
    meaning TEXT NOT NULL CHECK (meaning IN ('Review','Approval','Effective Release','Retirement')),
    required_role_id TEXT NOT NULL,
    sequence_no INTEGER NOT NULL,
    PRIMARY KEY (document_id, meaning),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (required_role_id) REFERENCES roles(id)
  )`,
  `CREATE TABLE IF NOT EXISTS signatures (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    version_id TEXT NOT NULL,
    signer_user_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    meaning TEXT NOT NULL,
    reason TEXT NOT NULL,
    signature_hash TEXT NOT NULL UNIQUE,
    signed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (version_id) REFERENCES document_versions(id),
    FOREIGN KEY (signer_user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
  )`,
  `CREATE TABLE IF NOT EXISTS training_assignments (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    training_group TEXT NOT NULL,
    assigned_count INTEGER NOT NULL,
    completed_count INTEGER NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Open','Complete','Overdue')),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    document_id TEXT,
    actor_user_id TEXT,
    action TEXT NOT NULL,
    note TEXT NOT NULL,
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL,
    FOREIGN KEY (actor_user_id) REFERENCES users(id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status)`,
  `CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type_id)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_document ON audit_events(document_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_signatures_document ON signatures(document_id, signed_at)`,
];
