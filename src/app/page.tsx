"use client";

import {
  Activity,
  Archive,
  BadgeCheck,
  Bell,
  BookOpenCheck,
  CalendarClock,
  Check,
  ChevronRight,
  ClipboardCheck,
  Database,
  Download,
  Eye,
  FileArchive,
  FilePlus2,
  FileText,
  Filter,
  Fingerprint,
  History,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  PenLine,
  Search,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Stamp,
  UserCog,
  UserRoundCheck,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Status =
  | "Draft"
  | "In Review"
  | "Approved"
  | "Effective"
  | "Under Revision"
  | "Retired";

type Module =
  | "Dashboard"
  | "Register"
  | "Workflow"
  | "E-Sign"
  | "Training"
  | "Retention"
  | "Reports"
  | "Admin";

type Role =
  | "Document Owner"
  | "Technical Reviewer"
  | "QA Approver"
  | "Training Coordinator"
  | "System Admin";

type SignatureType = "Review" | "Approval" | "Effective Release" | "Retirement";

type SignatureRecord = {
  id: string;
  documentId: string;
  signer: string;
  role: Role;
  meaning: SignatureType;
  reason: string;
  timestamp: string;
  hash: string;
};

type TrainingRecord = {
  group: string;
  assigned: number;
  complete: number;
  dueDate: string;
};

type DocumentRecord = {
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

type AuditRecord = {
  id: string;
  action: string;
  actor: string;
  time: string;
  documentId: string;
  note: string;
};

const lifecycle: Status[] = [
  "Draft",
  "In Review",
  "Approved",
  "Effective",
  "Under Revision",
  "Retired",
];

const modules: Array<[Module, LucideIcon]> = [
  ["Dashboard", LayoutDashboard],
  ["Register", FileText],
  ["Workflow", Workflow],
  ["E-Sign", Fingerprint],
  ["Training", BookOpenCheck],
  ["Retention", FileArchive],
  ["Reports", Activity],
  ["Admin", Settings2],
];

const documentTypes = [
  "SOP",
  "STP",
  "BMR",
  "Protocol",
  "Policy",
  "Work Instruction",
  "Specification",
  "Template",
  "Validation Report",
  "Quality Manual",
];

const departments = [
  "Quality Assurance",
  "Quality Control",
  "Manufacturing",
  "Validation",
  "Regulatory Affairs",
  "Warehouse",
  "Engineering",
  "IT Quality",
];

const defaultSignatures: SignatureType[] = [
  "Review",
  "Approval",
  "Effective Release",
];

const signatureSeed: SignatureRecord = {
  id: "SIG-2301",
  documentId: "QA-SOP-0142",
  signer: "Priya Nair",
  role: "QA Approver",
  meaning: "Effective Release",
  reason: "Approved controlled copy for effective use",
  timestamp: "2026-02-17 17:42 IST",
  hash: "b6a9-42f1-89ec",
};

const documentsSeed: DocumentRecord[] = [
  {
    id: "QA-SOP-0142",
    title: "Deviation Handling and CAPA Escalation",
    type: "SOP",
    department: "Quality Assurance",
    owner: "Aarav Mehta",
    status: "Effective",
    revision: "04",
    effectiveDate: "2026-02-18",
    nextReview: "2026-08-18",
    retention: "8 years after retirement",
    risk: "High",
    training: "Complete",
    tags: ["GMP", "CAPA", "Deviation"],
    reviewers: ["QA Head", "Manufacturing", "Regulatory"],
    requiredSignatures: defaultSignatures,
    signatures: [signatureSeed],
    trainingRecords: [
      { group: "QA Investigators", assigned: 18, complete: 18, dueDate: "2026-02-25" },
      { group: "Production Supervisors", assigned: 31, complete: 31, dueDate: "2026-02-25" },
    ],
    changeControl: "CC-2026-0041",
    storage: "Controlled copy",
    lastAction: "Training impact closed",
  },
  {
    id: "QC-STP-0087",
    title: "Assay Method for Finished Product Release",
    type: "STP",
    department: "Quality Control",
    owner: "Neha Iyer",
    status: "In Review",
    revision: "02",
    effectiveDate: "2026-05-30",
    nextReview: "2027-05-30",
    retention: "Product lifecycle + 1 year",
    risk: "Medium",
    training: "Pending",
    tags: ["QC", "Assay", "Release"],
    reviewers: ["QC Manager", "QA Reviewer"],
    requiredSignatures: ["Review", "Approval"],
    signatures: [],
    trainingRecords: [
      { group: "QC Analysts", assigned: 12, complete: 4, dueDate: "2026-06-03" },
    ],
    changeControl: "CC-2026-0092",
    storage: "Working draft",
    lastAction: "Second reviewer assigned",
  },
  {
    id: "MFG-BMR-0211",
    title: "Batch Manufacturing Record - Tablet Line 2",
    type: "BMR",
    department: "Manufacturing",
    owner: "Rohan Shah",
    status: "Approved",
    revision: "01",
    effectiveDate: "2026-06-01",
    nextReview: "2026-12-01",
    retention: "Batch expiry + 1 year",
    risk: "High",
    training: "Pending",
    tags: ["Batch", "Compression", "Packaging"],
    reviewers: ["Production Head", "QA Approver"],
    requiredSignatures: defaultSignatures,
    signatures: [
      {
        id: "SIG-2304",
        documentId: "MFG-BMR-0211",
        signer: "Rohan Shah",
        role: "Document Owner",
        meaning: "Review",
        reason: "Manufacturing content verified",
        timestamp: "2026-05-14 09:30 IST",
        hash: "d938-6ac4-230b",
      },
      {
        id: "SIG-2305",
        documentId: "MFG-BMR-0211",
        signer: "Priya Nair",
        role: "QA Approver",
        meaning: "Approval",
        reason: "Approved for release planning",
        timestamp: "2026-05-14 10:24 IST",
        hash: "fa30-192d-aa75",
      },
    ],
    trainingRecords: [
      { group: "Line 2 Operators", assigned: 44, complete: 19, dueDate: "2026-05-31" },
    ],
    changeControl: "CC-2026-0107",
    storage: "Controlled copy",
    lastAction: "QA approval completed",
  },
  {
    id: "VAL-PROT-0056",
    title: "Cleaning Validation Protocol - Granulation Suite",
    type: "Protocol",
    department: "Validation",
    owner: "Mira Kapoor",
    status: "Under Revision",
    revision: "03",
    effectiveDate: "2025-11-10",
    nextReview: "2026-05-20",
    retention: "Validation lifecycle",
    risk: "Medium",
    training: "Not required",
    tags: ["Validation", "Cleaning", "Protocol"],
    reviewers: ["Validation Lead", "QA Reviewer"],
    requiredSignatures: ["Review", "Approval"],
    signatures: [],
    trainingRecords: [],
    changeControl: "CC-2026-0088",
    storage: "Working draft",
    lastAction: "Revision opened from periodic review",
  },
  {
    id: "REG-POL-0009",
    title: "Regulatory Dossier Document Control Policy",
    type: "Policy",
    department: "Regulatory Affairs",
    owner: "Sara Khan",
    status: "Draft",
    revision: "01",
    effectiveDate: "2026-07-01",
    nextReview: "2027-07-01",
    retention: "Permanent",
    risk: "Low",
    training: "Not required",
    tags: ["Regulatory", "Dossier"],
    reviewers: ["Regulatory Head"],
    requiredSignatures: ["Review", "Approval"],
    signatures: [],
    trainingRecords: [],
    changeControl: "CC-2026-0116",
    storage: "Working draft",
    lastAction: "Draft created",
  },
  {
    id: "WH-WI-0033",
    title: "Warehouse Temperature Excursion Work Instruction",
    type: "Work Instruction",
    department: "Warehouse",
    owner: "Kabir Jain",
    status: "Retired",
    revision: "05",
    effectiveDate: "2024-04-06",
    nextReview: "2026-04-06",
    retention: "6 years after retirement",
    risk: "Medium",
    training: "Complete",
    tags: ["Warehouse", "Temperature"],
    reviewers: ["Warehouse Lead", "QA Approver"],
    requiredSignatures: ["Retirement"],
    signatures: [
      {
        id: "SIG-2240",
        documentId: "WH-WI-0033",
        signer: "Priya Nair",
        role: "QA Approver",
        meaning: "Retirement",
        reason: "Procedure merged into WH-SOP-0048",
        timestamp: "2026-04-06 11:15 IST",
        hash: "41bf-7c93-20de",
      },
    ],
    trainingRecords: [
      { group: "Warehouse Users", assigned: 21, complete: 21, dueDate: "2024-04-15" },
    ],
    changeControl: "CC-2026-0053",
    storage: "Archive",
    lastAction: "Retired after procedure merge",
  },
];

const auditSeed: AuditRecord[] = [
  {
    id: "AUD-1098",
    action: "E-signature captured",
    actor: "Priya Nair",
    time: "Today, 10:24",
    documentId: "MFG-BMR-0211",
    note: "QA Approval completed with hash fa30-192d-aa75.",
  },
  {
    id: "AUD-1097",
    action: "Reviewer assigned",
    actor: "Neha Iyer",
    time: "Today, 09:50",
    documentId: "QC-STP-0087",
    note: "QC Manager added as primary technical reviewer.",
  },
  {
    id: "AUD-1096",
    action: "Revision opened",
    actor: "Mira Kapoor",
    time: "Yesterday, 16:35",
    documentId: "VAL-PROT-0056",
    note: "Revision opened from periodic review finding.",
  },
  {
    id: "AUD-1095",
    action: "Training closed",
    actor: "Aarav Mehta",
    time: "Yesterday, 12:10",
    documentId: "QA-SOP-0142",
    note: "All impacted users completed read and understand training.",
  },
];

const statusTone: Record<Status, string> = {
  Draft: "bg-slate-100 text-slate-700 ring-slate-200",
  "In Review": "bg-amber-50 text-amber-800 ring-amber-200",
  Approved: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  Effective: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  "Under Revision": "bg-sky-50 text-sky-800 ring-sky-200",
  Retired: "bg-zinc-100 text-zinc-700 ring-zinc-200",
};

const riskTone = {
  Low: "text-emerald-700 bg-emerald-50",
  Medium: "text-amber-700 bg-amber-50",
  High: "text-rose-700 bg-rose-50",
};

const nextStatus: Record<Status, Status> = {
  Draft: "In Review",
  "In Review": "Approved",
  Approved: "Effective",
  Effective: "Under Revision",
  "Under Revision": "In Review",
  Retired: "Retired",
};

const storageKey = "pharma-dms-production-state-v1";

function readStoredState() {
  if (typeof window === "undefined") {
    return { documents: documentsSeed, audit: auditSeed };
  }

  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    return { documents: documentsSeed, audit: auditSeed };
  }

  try {
    return JSON.parse(stored) as {
      documents: DocumentRecord[];
      audit: AuditRecord[];
    };
  } catch {
    window.localStorage.removeItem(storageKey);
    return { documents: documentsSeed, audit: auditSeed };
  }
}

function completionPercent(record: TrainingRecord) {
  if (record.assigned === 0) return 100;
  return Math.round((record.complete / record.assigned) * 100);
}

function hashSignature(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0").slice(0, 12);
}

function todayStamp() {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

export default function Home() {
  const initialState = useMemo(() => readStoredState(), []);
  const [activeModule, setActiveModule] = useState<Module>("Dashboard");
  const [documents, setDocuments] = useState(initialState.documents);
  const [selectedId, setSelectedId] = useState(
    initialState.documents[0]?.id ?? documentsSeed[0].id,
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [audit, setAudit] = useState(initialState.audit);
  const [newDoc, setNewDoc] = useState({
    title: "",
    type: "SOP",
    department: "Quality Assurance",
    owner: "",
    risk: "Medium" as DocumentRecord["risk"],
  });
  const [signature, setSignature] = useState({
    signer: "Priya Nair",
    role: "QA Approver" as Role,
    meaning: "Approval" as SignatureType,
    password: "",
    reason: "",
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify({ documents, audit }));
  }, [documents, audit]);

  const filteredDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return documents.filter((document) => {
      const matchesQuery =
        !normalized ||
        [
          document.id,
          document.title,
          document.owner,
          document.department,
          document.changeControl,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesStatus =
        statusFilter === "All" || document.status === statusFilter;
      const matchesType = typeFilter === "All" || document.type === typeFilter;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [documents, query, statusFilter, typeFilter]);

  const selectedDocument =
    documents.find((document) => document.id === selectedId) ?? documents[0];

  const pendingSignatures = documents.flatMap((document) =>
    document.requiredSignatures
      .filter(
        (meaning) =>
          !document.signatures.some((signature) => signature.meaning === meaning),
      )
      .map((meaning) => ({ document, meaning })),
  );

  const metrics = [
    {
      label: "Controlled documents",
      value: documents.length.toString(),
      detail: "Across all departments",
      icon: FileText,
    },
    {
      label: "Open signatures",
      value: pendingSignatures.length.toString(),
      detail: "Awaiting e-sign action",
      icon: Fingerprint,
    },
    {
      label: "Training impact",
      value: documents
        .filter((document) => document.training === "Pending")
        .length.toString(),
      detail: "Must close before release",
      icon: BookOpenCheck,
    },
    {
      label: "Due this month",
      value: documents
        .filter((document) => document.nextReview <= "2026-05-31")
        .length.toString(),
      detail: "Periodic review queue",
      icon: CalendarClock,
    },
  ];

  function addAudit(action: string, actor: string, documentId: string, note: string) {
    setAudit((current) => [
      {
        id: `AUD-${1100 + current.length}`,
        action,
        actor,
        time: "Just now",
        documentId,
        note,
      },
      ...current,
    ]);
  }

  function advanceDocument(document: DocumentRecord) {
    const targetStatus = nextStatus[document.status];
    if (targetStatus === document.status) return;

    setDocuments((current) =>
      current.map((item) =>
        item.id === document.id
          ? {
              ...item,
              status: targetStatus,
              storage:
                targetStatus === "Effective"
                  ? "Controlled copy"
                  : targetStatus === "Retired"
                    ? "Archive"
                    : item.storage,
              lastAction: `Moved to ${targetStatus}`,
              training:
                targetStatus === "Effective" && item.risk !== "Low"
                  ? "Pending"
                  : item.training,
            }
          : item,
      ),
    );
    addAudit(
      `Lifecycle moved to ${targetStatus}`,
      document.owner,
      document.id,
      `${document.id} advanced from ${document.status} to ${targetStatus}.`,
    );
  }

  function createDocument() {
    if (!newDoc.title.trim() || !newDoc.owner.trim()) return;
    const idPrefix = newDoc.type.slice(0, 3).toUpperCase().replace(/\s/g, "");
    const created: DocumentRecord = {
      id: `${idPrefix}-${String(220 + documents.length).padStart(4, "0")}`,
      title: newDoc.title.trim(),
      type: newDoc.type,
      department: newDoc.department,
      owner: newDoc.owner.trim(),
      status: "Draft",
      revision: "01",
      effectiveDate: "Not set",
      nextReview: "Not set",
      retention: "Policy driven",
      risk: newDoc.risk,
      training: "Not required",
      tags: [newDoc.type, newDoc.department.split(" ")[0]],
      reviewers: ["QA Reviewer"],
      requiredSignatures: ["Review", "Approval"],
      signatures: [],
      trainingRecords: [],
      changeControl: `CC-2026-${String(120 + documents.length).padStart(4, "0")}`,
      storage: "Working draft",
      lastAction: "Draft created",
    };

    setDocuments((current) => [created, ...current]);
    setSelectedId(created.id);
    setActiveModule("Register");
    addAudit(
      "Document created",
      created.owner,
      created.id,
      `${created.id} added as ${created.type} for ${created.department}.`,
    );
    setNewDoc({
      title: "",
      type: "SOP",
      department: "Quality Assurance",
      owner: "",
      risk: "Medium",
    });
  }

  function signDocument() {
    if (!signature.signer.trim() || !signature.password.trim() || !signature.reason.trim()) {
      return;
    }

    const exists = selectedDocument.signatures.some(
      (item) => item.meaning === signature.meaning,
    );
    if (exists) return;

    const raw = `${selectedDocument.id}:${signature.signer}:${signature.meaning}:${signature.reason}:${Date.now()}`;
    const signed: SignatureRecord = {
      id: `SIG-${2300 + audit.length}`,
      documentId: selectedDocument.id,
      signer: signature.signer.trim(),
      role: signature.role,
      meaning: signature.meaning,
      reason: signature.reason.trim(),
      timestamp: todayStamp(),
      hash: hashSignature(raw),
    };

    setDocuments((current) =>
      current.map((document) =>
        document.id === selectedDocument.id
          ? {
              ...document,
              signatures: [...document.signatures, signed],
              status:
                signature.meaning === "Approval" && document.status === "In Review"
                  ? "Approved"
                  : signature.meaning === "Effective Release"
                    ? "Effective"
                    : document.status,
              lastAction: `${signature.meaning} signed by ${signature.signer}`,
            }
          : document,
      ),
    );
    addAudit(
      "E-signature captured",
      signed.signer,
      selectedDocument.id,
      `${signed.meaning} completed as ${signed.role}. Hash ${signed.hash}.`,
    );
    setSignature((current) => ({ ...current, password: "", reason: "" }));
  }

  const selectedAudit = audit.filter(
    (entry) => entry.documentId === selectedDocument.id,
  );
  const allTraining = documents.flatMap((document) =>
    document.trainingRecords.map((record) => ({ document, record })),
  );

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#1f2924]">
      <section className="border-b border-[#dfe5dc] bg-[#fbfcf9]">
        <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-lg bg-[#173d35] text-white shadow-sm">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#69756d]">
                  GxP document lifecycle workspace
                </p>
                <h1 className="text-2xl font-semibold tracking-normal text-[#17211d] sm:text-3xl">
                  Pharma DMS
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="inline-flex h-10 items-center gap-2 rounded-md border border-[#d8dfd6] bg-white px-3 text-sm font-medium text-[#314039] shadow-sm transition hover:bg-[#f2f5ef]">
                <Bell size={16} />
                {pendingSignatures.length} signature tasks
              </button>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#173d35] px-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#225347]"
                onClick={() => setActiveModule("Register")}
              >
                <FilePlus2 size={16} />
                New document
              </button>
            </div>
          </header>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1540px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <aside className="h-fit rounded-lg border border-[#dfe5dc] bg-white p-3 shadow-sm">
          <nav className="grid gap-1">
            {modules.map(([label, Icon]) => (
              <button
                className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
                  activeModule === label
                    ? "bg-[#e8f0e8] text-[#173d35]"
                    : "text-[#405047] hover:bg-[#f2f5ef]"
                }`}
                key={label}
                onClick={() => setActiveModule(label)}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-4 rounded-md bg-[#f3f6f1] p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#21372f]">
              <LockKeyhole size={16} />
              Evidence rule
            </div>
            <p className="mt-2 text-sm leading-6 text-[#66736b]">
              No self-answering: records, signatures, and decisions must link to
              controlled documents and audit evidence.
            </p>
          </div>
          <div className="mt-3 rounded-md border border-[#e1e7de] p-3">
            <p className="text-sm font-semibold text-[#21372f]">Validation boundary</p>
            <p className="mt-2 text-sm leading-6 text-[#66736b]">
              UI is validation-ready. A real release still needs backend auth,
              database controls, backups, and Part 11 testing.
            </p>
          </div>
        </aside>

        <div className="grid gap-5">
          {activeModule === "Dashboard" && (
            <Dashboard
              documents={documents}
              pendingSignatures={pendingSignatures}
              audit={audit}
              setActiveModule={setActiveModule}
              setSelectedId={setSelectedId}
            />
          )}

          {activeModule === "Register" && (
            <Register
              documents={filteredDocuments}
              selectedDocument={selectedDocument}
              query={query}
              setQuery={setQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              setSelectedId={setSelectedId}
              newDoc={newDoc}
              setNewDoc={setNewDoc}
              createDocument={createDocument}
              advanceDocument={advanceDocument}
            />
          )}

          {activeModule === "Workflow" && (
            <WorkflowBoard
              documents={documents}
              selectedDocument={selectedDocument}
              setSelectedId={setSelectedId}
              advanceDocument={advanceDocument}
            />
          )}

          {activeModule === "E-Sign" && (
            <ESign
              selectedDocument={selectedDocument}
              signature={signature}
              setSignature={setSignature}
              signDocument={signDocument}
              audit={selectedAudit}
            />
          )}

          {activeModule === "Training" && (
            <TrainingCenter documents={documents} training={allTraining} />
          )}

          {activeModule === "Retention" && (
            <Retention documents={documents} />
          )}

          {activeModule === "Reports" && (
            <Reports documents={documents} audit={audit} />
          )}

          {activeModule === "Admin" && <Admin />}
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-[#dfe5dc] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#69756d]">{label}</p>
        <Icon className="text-[#597267]" size={18} />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-normal text-[#17211d]">
        {value}
      </p>
      <p className="mt-1 text-sm text-[#69756d]">{detail}</p>
    </div>
  );
}

function Dashboard({
  documents,
  pendingSignatures,
  audit,
  setActiveModule,
  setSelectedId,
}: {
  documents: DocumentRecord[];
  pendingSignatures: Array<{ document: DocumentRecord; meaning: SignatureType }>;
  audit: AuditRecord[];
  setActiveModule: (module: Module) => void;
  setSelectedId: (id: string) => void;
}) {
  const highRisk = documents.filter((document) => document.risk === "High");
  const dashboardStats: Array<[string, number, LucideIcon]> = [
    ["High risk records", highRisk.length, ShieldAlert],
    [
      "Effective copies",
      documents.filter((item) => item.status === "Effective").length,
      BadgeCheck,
    ],
    ["Audit events", audit.length, History],
  ];

  return (
    <section className="grid gap-5">
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel
          title="Command center"
          subtitle="A compact operational view for QA, document owners, and approvers."
          icon={LayoutDashboard}
        >
          <div className="grid gap-3 md:grid-cols-3">
            {dashboardStats.map(([label, value, Icon]) => (
              <div className="rounded-lg border border-[#e3e8e0] bg-[#fbfcf9] p-4" key={label as string}>
                <Icon className="text-[#597267]" size={20} />
                <p className="mt-3 text-sm text-[#69756d]">{label as string}</p>
                <p className="mt-1 text-2xl font-semibold text-[#17211d]">{value as number}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3">
            {pendingSignatures.slice(0, 4).map(({ document, meaning }) => (
              <button
                className="flex items-center justify-between gap-3 rounded-lg border border-[#e3e8e0] bg-white p-3 text-left transition hover:border-[#c7d2c4]"
                key={`${document.id}-${meaning}`}
                onClick={() => {
                  setSelectedId(document.id);
                  setActiveModule("E-Sign");
                }}
              >
                <div>
                  <p className="text-sm font-semibold text-[#24332d]">
                    {meaning} pending · {document.id}
                  </p>
                  <p className="mt-1 text-sm text-[#69756d]">{document.title}</p>
                </div>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Compliance posture" subtitle="Validation-ready controls present in this v1." icon={ShieldCheck}>
          <div className="grid gap-3">
            {[
              "Role-aware e-signature meanings",
              "Complete audit trail for controlled actions",
              "Revision and lifecycle state visibility",
              "Training impact and retention metadata",
              "Configurable document types and approval routes",
            ].map((item) => (
              <div className="flex items-center gap-2 text-sm text-[#405047]" key={item}>
                <Check className="text-emerald-700" size={16} />
                {item}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function Register({
  documents,
  selectedDocument,
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  setSelectedId,
  newDoc,
  setNewDoc,
  createDocument,
  advanceDocument,
}: {
  documents: DocumentRecord[];
  selectedDocument: DocumentRecord;
  query: string;
  setQuery: (value: string) => void;
  statusFilter: Status | "All";
  setStatusFilter: (value: Status | "All") => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  setSelectedId: (id: string) => void;
  newDoc: {
    title: string;
    type: string;
    department: string;
    owner: string;
    risk: DocumentRecord["risk"];
  };
  setNewDoc: React.Dispatch<React.SetStateAction<{
    title: string;
    type: string;
    department: string;
    owner: string;
    risk: DocumentRecord["risk"];
  }>>;
  createDocument: () => void;
  advanceDocument: (document: DocumentRecord) => void;
}) {
  return (
    <section className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_390px]">
      <Panel
        title="Controlled document register"
        subtitle="Search, classify, and track every record across its controlled life."
        icon={FileText}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <FieldShell icon={Search}>
              <input
                className="w-full bg-transparent text-[#17211d] outline-none placeholder:text-[#8a968d]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search ID, title, owner, change control"
                value={query}
              />
            </FieldShell>
            <FieldShell icon={Filter}>
              <select
                className="bg-transparent text-[#17211d] outline-none"
                onChange={(event) =>
                  setStatusFilter(event.target.value as Status | "All")
                }
                value={statusFilter}
              >
                <option>All</option>
                {lifecycle.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </FieldShell>
            <FieldShell icon={SlidersHorizontal}>
              <select
                className="bg-transparent text-[#17211d] outline-none"
                onChange={(event) => setTypeFilter(event.target.value)}
                value={typeFilter}
              >
                <option>All</option>
                {documentTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </FieldShell>
          </div>
        }
      >
        <div className="-mx-4 -mb-4 overflow-x-auto">
          <table className="w-full min-w-[1040px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-[#69756d]">
                {["Document", "Type", "Owner", "Status", "Review", "Training", "Signatures", ""].map((heading) => (
                  <th className="border-b border-[#e7ece4] px-4 py-3 font-medium" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr
                  className={`cursor-pointer transition hover:bg-[#f8faf6] ${
                    selectedDocument.id === document.id ? "bg-[#f2f6f1]" : ""
                  }`}
                  key={document.id}
                  onClick={() => setSelectedId(document.id)}
                >
                  <td className="border-b border-[#edf1ea] px-4 py-3">
                    <p className="font-semibold text-[#17211d]">{document.title}</p>
                    <p className="mt-1 text-xs text-[#69756d]">
                      {document.id} · Rev {document.revision} · {document.changeControl}
                    </p>
                  </td>
                  <td className="border-b border-[#edf1ea] px-4 py-3 text-[#405047]">{document.type}</td>
                  <td className="border-b border-[#edf1ea] px-4 py-3">
                    <p className="text-[#24332d]">{document.owner}</p>
                    <p className="mt-1 text-xs text-[#69756d]">{document.department}</p>
                  </td>
                  <td className="border-b border-[#edf1ea] px-4 py-3">
                    <StatusPill status={document.status} />
                  </td>
                  <td className="border-b border-[#edf1ea] px-4 py-3 text-[#405047]">{document.nextReview}</td>
                  <td className="border-b border-[#edf1ea] px-4 py-3 text-[#405047]">{document.training}</td>
                  <td className="border-b border-[#edf1ea] px-4 py-3 text-[#405047]">
                    {document.signatures.length}/{document.requiredSignatures.length}
                  </td>
                  <td className="border-b border-[#edf1ea] px-4 py-3">
                    <button
                      aria-label={`Open ${document.id}`}
                      className="grid size-8 place-items-center rounded-md border border-[#d8dfd6] bg-white text-[#405047] transition hover:bg-[#edf3eb]"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <aside className="grid gap-5">
        <DocumentDetail document={selectedDocument} advanceDocument={advanceDocument} />
        <Panel title="Add document" subtitle="Start any controlled record as a managed draft." icon={FilePlus2}>
          <div className="grid gap-3">
            <Input value={newDoc.title} placeholder="Document title" onChange={(value) => setNewDoc((current) => ({ ...current, title: value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={newDoc.type} options={documentTypes} onChange={(value) => setNewDoc((current) => ({ ...current, type: value }))} />
              <Select value={newDoc.risk} options={["Low", "Medium", "High"]} onChange={(value) => setNewDoc((current) => ({ ...current, risk: value as DocumentRecord["risk"] }))} />
            </div>
            <Select value={newDoc.department} options={departments} onChange={(value) => setNewDoc((current) => ({ ...current, department: value }))} />
            <Input value={newDoc.owner} placeholder="Document owner" onChange={(value) => setNewDoc((current) => ({ ...current, owner: value }))} />
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#173d35] px-3 text-sm font-semibold text-white transition hover:bg-[#225347]" onClick={createDocument}>
              <PenLine size={16} />
              Create controlled draft
            </button>
          </div>
        </Panel>
      </aside>
    </section>
  );
}

function DocumentDetail({
  document,
  advanceDocument,
}: {
  document: DocumentRecord;
  advanceDocument: (document: DocumentRecord) => void;
}) {
  return (
    <Panel title="Active record" subtitle={document.id} icon={Eye}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-7 text-[#17211d]">{document.title}</h3>
        <StatusPill status={document.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {[
          ["Revision", document.revision],
          ["Type", document.type],
          ["Effective", document.effectiveDate],
          ["Next review", document.nextReview],
          ["Risk", document.risk],
          ["Storage", document.storage],
        ].map(([label, value]) => (
          <div className="rounded-md bg-[#f7f9f4] p-3" key={label}>
            <p className="text-xs font-medium uppercase tracking-normal text-[#7a867e]">{label}</p>
            {label === "Risk" ? (
              <span className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${riskTone[value as DocumentRecord["risk"]]}`}>
                {value}
              </span>
            ) : (
              <p className="mt-1 font-semibold text-[#24332d]">{value}</p>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {document.tags.map((tag) => (
          <span className="rounded-md bg-[#eef3eb] px-2 py-1 text-xs font-medium text-[#536159]" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <button
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#173d35] px-3 text-sm font-semibold text-white transition hover:bg-[#225347] disabled:cursor-not-allowed disabled:bg-[#9eaaa4]"
        disabled={document.status === "Retired"}
        onClick={() => advanceDocument(document)}
      >
        <Check size={16} />
        Move to {nextStatus[document.status]}
      </button>
    </Panel>
  );
}

function WorkflowBoard({
  documents,
  selectedDocument,
  setSelectedId,
  advanceDocument,
}: {
  documents: DocumentRecord[];
  selectedDocument: DocumentRecord;
  setSelectedId: (id: string) => void;
  advanceDocument: (document: DocumentRecord) => void;
}) {
  return (
    <section className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_390px]">
      <Panel title="Lifecycle board" subtitle="Every column is a controlled state, not a loose task list." icon={Workflow}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {lifecycle.map((status) => {
            const items = documents.filter((document) => document.status === status);
            return (
              <div className="min-h-[180px] rounded-lg border border-[#e3e8e0] bg-[#fbfcf9] p-3" key={status}>
                <div className="flex items-center justify-between gap-2">
                  <StatusPill status={status} />
                  <span className="text-sm font-semibold text-[#69756d]">{items.length}</span>
                </div>
                <div className="mt-3 grid gap-2">
                  {items.map((document) => (
                    <button
                      className="rounded-md border border-[#e3e8e0] bg-white p-3 text-left shadow-sm transition hover:border-[#c7d2c4]"
                      key={document.id}
                      onClick={() => setSelectedId(document.id)}
                    >
                      <p className="text-sm font-semibold text-[#24332d]">{document.id}</p>
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#69756d]">{document.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
      <DocumentDetail document={selectedDocument} advanceDocument={advanceDocument} />
    </section>
  );
}

function ESign({
  selectedDocument,
  signature,
  setSignature,
  signDocument,
  audit,
}: {
  selectedDocument: DocumentRecord;
  signature: {
    signer: string;
    role: Role;
    meaning: SignatureType;
    password: string;
    reason: string;
  };
  setSignature: React.Dispatch<React.SetStateAction<{
    signer: string;
    role: Role;
    meaning: SignatureType;
    password: string;
    reason: string;
  }>>;
  signDocument: () => void;
  audit: AuditRecord[];
}) {
  const signedMeanings = selectedDocument.signatures.map((item) => item.meaning);
  const canSign = !signedMeanings.includes(signature.meaning);
  return (
    <section className="grid gap-5 2xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
      <Panel title="Electronic signature" subtitle="Meaning-based approval with reason, credential re-entry, timestamp, and hash." icon={Fingerprint}>
        <div className="rounded-lg border border-[#e3e8e0] bg-[#fbfcf9] p-4">
          <p className="text-sm font-medium text-[#69756d]">Signing for</p>
          <h2 className="mt-1 text-xl font-semibold text-[#17211d]">{selectedDocument.id}</h2>
          <p className="mt-2 text-sm leading-6 text-[#536159]">{selectedDocument.title}</p>
        </div>
        <div className="mt-4 grid gap-3">
          <Input value={signature.signer} placeholder="Signer name" onChange={(value) => setSignature((current) => ({ ...current, signer: value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select
              value={signature.role}
              options={["Document Owner", "Technical Reviewer", "QA Approver", "Training Coordinator", "System Admin"]}
              onChange={(value) => setSignature((current) => ({ ...current, role: value as Role }))}
            />
            <Select
              value={signature.meaning}
              options={["Review", "Approval", "Effective Release", "Retirement"]}
              onChange={(value) => setSignature((current) => ({ ...current, meaning: value as SignatureType }))}
            />
          </div>
          <Input value={signature.reason} placeholder="Reason / signing meaning note" onChange={(value) => setSignature((current) => ({ ...current, reason: value }))} />
          <input
            className="h-10 rounded-md border border-[#d8dfd6] bg-[#fbfcf9] px-3 text-sm outline-none transition focus:border-[#789085]"
            onChange={(event) => setSignature((current) => ({ ...current, password: event.target.value }))}
            placeholder="Re-enter password"
            type="password"
            value={signature.password}
          />
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#173d35] px-3 text-sm font-semibold text-white transition hover:bg-[#225347] disabled:bg-[#9eaaa4]"
            disabled={!canSign}
            onClick={signDocument}
          >
            <Stamp size={16} />
            Apply e-signature
          </button>
          {!canSign && (
            <p className="text-sm text-[#9b5a13]">This signing meaning is already completed for the selected revision.</p>
          )}
        </div>
      </Panel>

      <Panel title="Signature evidence" subtitle="Stored signatures and related audit records for the active document." icon={KeyRound}>
        <div className="grid gap-3">
          {selectedDocument.requiredSignatures.map((meaning) => {
            const item = selectedDocument.signatures.find((signature) => signature.meaning === meaning);
            return (
              <div className="rounded-lg border border-[#e3e8e0] bg-[#fbfcf9] p-3" key={meaning}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#24332d]">{meaning}</p>
                  {item ? (
                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Signed</span>
                  ) : (
                    <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">Pending</span>
                  )}
                </div>
                {item && (
                  <p className="mt-2 text-sm leading-6 text-[#536159]">
                    {item.signer} · {item.role} · {item.timestamp} · hash {item.hash}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid gap-3">
          {audit.map((entry) => (
            <div className="rounded-lg border border-[#e3e8e0] bg-white p-3" key={entry.id}>
              <p className="text-sm font-semibold text-[#24332d]">{entry.action}</p>
              <p className="mt-1 text-xs text-[#69756d]">{entry.actor} · {entry.time}</p>
              <p className="mt-2 text-sm leading-6 text-[#536159]">{entry.note}</p>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function TrainingCenter({
  documents,
  training,
}: {
  documents: DocumentRecord[];
  training: Array<{ document: DocumentRecord; record: TrainingRecord }>;
}) {
  return (
    <Panel title="Training impact" subtitle="Read-and-understand assignments tied to effective documents." icon={BookOpenCheck}>
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Impacted docs" value={documents.filter((item) => item.training === "Pending").length.toString()} detail="Training still open" icon={BookOpenCheck} />
        <MetricCard label="Training groups" value={training.length.toString()} detail="Assigned curricula" icon={UserRoundCheck} />
        <MetricCard label="Completion avg" value={`${Math.round(training.reduce((sum, item) => sum + completionPercent(item.record), 0) / Math.max(training.length, 1))}%`} detail="Across active records" icon={BadgeCheck} />
      </div>
      <div className="mt-4 grid gap-3">
        {training.map(({ document, record }) => (
          <div className="rounded-lg border border-[#e3e8e0] bg-[#fbfcf9] p-4" key={`${document.id}-${record.group}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#24332d]">{record.group}</p>
                <p className="mt-1 text-sm text-[#69756d]">{document.id} · due {record.dueDate}</p>
              </div>
              <span className="text-sm font-semibold text-[#173d35]">{completionPercent(record)}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[#e3e8e0]">
              <div className="h-2 rounded-full bg-[#173d35]" style={{ width: `${completionPercent(record)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Retention({ documents }: { documents: DocumentRecord[] }) {
  return (
    <Panel title="Retention and archive" subtitle="Controlled copy state, archive disposition, and legal hold readiness." icon={FileArchive}>
      <div className="grid gap-3 md:grid-cols-3">
        {["Controlled copy", "Working draft", "Archive"].map((storage) => (
          <MetricCard
            key={storage}
            label={storage}
            value={documents.filter((document) => document.storage === storage).length.toString()}
            detail="Document storage class"
            icon={Archive}
          />
        ))}
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-[#69756d]">
              {["Document", "Status", "Retention rule", "Storage", "Next review"].map((heading) => (
                <th className="border-b border-[#e7ece4] px-4 py-3 font-medium" key={heading}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id}>
                <td className="border-b border-[#edf1ea] px-4 py-3">
                  <p className="font-semibold text-[#17211d]">{document.id}</p>
                  <p className="mt-1 text-xs text-[#69756d]">{document.title}</p>
                </td>
                <td className="border-b border-[#edf1ea] px-4 py-3"><StatusPill status={document.status} /></td>
                <td className="border-b border-[#edf1ea] px-4 py-3 text-[#405047]">{document.retention}</td>
                <td className="border-b border-[#edf1ea] px-4 py-3 text-[#405047]">{document.storage}</td>
                <td className="border-b border-[#edf1ea] px-4 py-3 text-[#405047]">{document.nextReview}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Reports({ documents, audit }: { documents: DocumentRecord[]; audit: AuditRecord[] }) {
  return (
    <section className="grid gap-5 2xl:grid-cols-2">
      <Panel title="Quality reports" subtitle="Exports and review packets for QA governance meetings." icon={Download}>
        <div className="grid gap-3">
          {[
            ["Document inventory", `${documents.length} records`, "Complete register with status, owner, risk, revision, training."],
            ["Open action report", `${documents.filter((item) => item.status !== "Effective" && item.status !== "Retired").length} records`, "Drafts, reviews, approvals, and revision records that need action."],
            ["Signature exception report", `${documents.filter((item) => item.signatures.length < item.requiredSignatures.length).length} records`, "Documents missing required signing meanings."],
            ["Audit trail export", `${audit.length} events`, "Timestamped event trail for inspection support."],
          ].map(([title, count, copy]) => (
            <div className="rounded-lg border border-[#e3e8e0] bg-[#fbfcf9] p-4" key={title}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#24332d]">{title}</p>
                <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-[#69756d]">{count}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#536159]">{copy}</p>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Validation package" subtitle="What this product needs before regulated production release." icon={Database}>
        <div className="grid gap-3">
          {[
            "User requirement specification and risk assessment",
            "Installation, operational, and performance qualification evidence",
            "Access matrix, password policy, and session controls",
            "Database backup, restore, and disaster recovery procedure",
            "E-signature meaning, credential re-entry, and non-repudiation testing",
            "Audit trail tamper resistance and export verification",
          ].map((item) => (
            <div className="flex items-center gap-2 rounded-md bg-[#fbfcf9] p-3 text-sm text-[#405047]" key={item}>
              <ClipboardCheck className="text-[#597267]" size={16} />
              {item}
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function Admin() {
  return (
    <section className="grid gap-5 2xl:grid-cols-2">
      <Panel title="System configuration" subtitle="Dynamic setup without hardcoding new document families." icon={Settings2}>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Document types", documentTypes.join(", ")],
            ["Departments", departments.join(", ")],
            ["Lifecycle", lifecycle.join(" -> ")],
            ["Signature meanings", "Review, Approval, Effective Release, Retirement"],
          ].map(([label, value]) => (
            <div className="rounded-lg border border-[#e3e8e0] bg-[#fbfcf9] p-4" key={label}>
              <p className="text-sm font-semibold text-[#24332d]">{label}</p>
              <p className="mt-2 text-sm leading-6 text-[#69756d]">{value}</p>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Roles and permissions" subtitle="Baseline GxP roles for controlled access." icon={UserCog}>
        <div className="grid gap-3">
          {[
            ["Document Owner", "Create drafts, propose revisions, assign reviewers"],
            ["Technical Reviewer", "Review assigned content and add technical signature"],
            ["QA Approver", "Approve, release, retire, and complete QA signatures"],
            ["Training Coordinator", "Assign and close training impact"],
            ["System Admin", "Configure metadata, roles, and retention policies"],
          ].map(([role, scope]) => (
            <div className="rounded-lg border border-[#e3e8e0] bg-[#fbfcf9] p-4" key={role}>
              <p className="text-sm font-semibold text-[#24332d]">{role}</p>
              <p className="mt-2 text-sm leading-6 text-[#69756d]">{scope}</p>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function Panel({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#dfe5dc] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#e3e8e0] pb-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-[#eef3eb] text-[#173d35]">
            <Icon size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#17211d]">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-[#69756d]">{subtitle}</p>
          </div>
        </div>
        {actions}
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}

function FieldShell({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <label className="flex h-10 min-w-[190px] items-center gap-2 rounded-md border border-[#d8dfd6] bg-[#fbfcf9] px-3 text-sm text-[#69756d]">
      <Icon size={16} />
      {children}
    </label>
  );
}

function Input({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      className="h-10 rounded-md border border-[#d8dfd6] bg-[#fbfcf9] px-3 text-sm outline-none transition focus:border-[#789085]"
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      value={value}
    />
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      className="h-10 rounded-md border border-[#d8dfd6] bg-[#fbfcf9] px-3 text-sm outline-none"
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ring-1 ${statusTone[status]}`}>
      {status}
    </span>
  );
}
