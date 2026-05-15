export type Status =
  | "Draft"
  | "In Review"
  | "Approved"
  | "Effective"
  | "Under Revision"
  | "Retired";

export type Module =
  | "Dashboard"
  | "Register"
  | "Workflow"
  | "E-Sign"
  | "Training"
  | "Retention"
  | "Reports"
  | "Admin";

export type Role =
  | "Document Owner"
  | "Technical Reviewer"
  | "QA Approver"
  | "Training Coordinator"
  | "System Admin";

export type SignatureType = "Review" | "Approval" | "Effective Release" | "Retirement";

export type SignatureRecord = {
  id: string;
  documentId: string;
  signer: string;
  role: Role;
  meaning: SignatureType;
  reason: string;
  timestamp: string;
  hash: string;
};

export type TrainingRecord = {
  group: string;
  assigned: number;
  complete: number;
  dueDate: string;
};

export type DocumentRecord = {
  id: string;
  title: string;
  type: string;
  department: string;
  owner: string;
  status: Status;
  revision: string;
  effectiveDate: string;
  nextReview: string;
  retention: string;
  risk: "Low" | "Medium" | "High";
  training: "Not required" | "Pending" | "Complete";
  tags: string[];
  reviewers: string[];
  requiredSignatures: SignatureType[];
  signatures: SignatureRecord[];
  trainingRecords: TrainingRecord[];
  changeControl: string;
  storage: "Controlled copy" | "Working draft" | "Archive";
  lastAction: string;
};

export type AuditRecord = {
  id: string;
  action: string;
  actor: string;
  time: string;
  documentId: string;
  note: string;
};
