"use client";

import {
  Activity,
  Archive,
  Bell,
  BookOpenCheck,
  CalendarClock,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileClock,
  FilePlus2,
  FileText,
  Filter,
  History,
  LayoutDashboard,
  LockKeyhole,
  PenLine,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

type Status =
  | "Draft"
  | "In Review"
  | "Approved"
  | "Effective"
  | "Under Revision"
  | "Retired";

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
  risk: "Low" | "Medium" | "High";
  training: "Not required" | "Pending" | "Complete";
  tags: string[];
  reviewers: string[];
  lastAction: string;
};

type AuditRecord = {
  id: string;
  action: string;
  actor: string;
  time: string;
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
    risk: "High",
    training: "Complete",
    tags: ["GMP", "CAPA", "Deviation"],
    reviewers: ["QA Head", "Manufacturing", "Regulatory"],
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
    risk: "Medium",
    training: "Pending",
    tags: ["QC", "Assay", "Release"],
    reviewers: ["QC Manager", "QA Reviewer"],
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
    risk: "High",
    training: "Pending",
    tags: ["Batch", "Compression", "Packaging"],
    reviewers: ["Production Head", "QA Approver"],
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
    risk: "Medium",
    training: "Not required",
    tags: ["Validation", "Cleaning", "Protocol"],
    reviewers: ["Validation Lead", "QA Reviewer"],
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
    risk: "Low",
    training: "Not required",
    tags: ["Regulatory", "Dossier"],
    reviewers: ["Regulatory Head"],
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
    risk: "Medium",
    training: "Complete",
    tags: ["Warehouse", "Temperature"],
    reviewers: ["Warehouse Lead", "QA Approver"],
    lastAction: "Retired after procedure merge",
  },
];

const auditSeed: AuditRecord[] = [
  {
    id: "AUD-1098",
    action: "Document approved",
    actor: "QA Approver",
    time: "Today, 10:24",
    note: "MFG-BMR-0211 moved to Approved with training impact pending.",
  },
  {
    id: "AUD-1097",
    action: "Reviewer assigned",
    actor: "Neha Iyer",
    time: "Today, 09:50",
    note: "QC Manager added as primary technical reviewer.",
  },
  {
    id: "AUD-1096",
    action: "Revision opened",
    actor: "Mira Kapoor",
    time: "Yesterday, 16:35",
    note: "VAL-PROT-0056 opened from periodic review finding.",
  },
  {
    id: "AUD-1095",
    action: "Training closed",
    actor: "Aarav Mehta",
    time: "Yesterday, 12:10",
    note: "All impacted users completed required read and understand training.",
  },
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
];

const departments = [
  "Quality Assurance",
  "Quality Control",
  "Manufacturing",
  "Validation",
  "Regulatory Affairs",
  "Warehouse",
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

export default function Home() {
  const [documents, setDocuments] = useState(documentsSeed);
  const [selectedId, setSelectedId] = useState(documentsSeed[0].id);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [audit, setAudit] = useState(auditSeed);
  const [newDoc, setNewDoc] = useState({
    title: "",
    type: "SOP",
    department: "Quality Assurance",
    owner: "",
    risk: "Medium" as DocumentRecord["risk"],
  });

  const filteredDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return documents.filter((document) => {
      const matchesQuery =
        !normalized ||
        [document.id, document.title, document.owner, document.department]
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

  const metrics = useMemo(
    () => [
      {
        label: "Controlled documents",
        value: documents.length.toString(),
        detail: "Across all departments",
        icon: FileText,
      },
      {
        label: "Pending review",
        value: documents
          .filter((document) => document.status === "In Review")
          .length.toString(),
        detail: "Awaiting reviewer action",
        icon: ClipboardCheck,
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
    ],
    [documents],
  );

  function advanceDocument(document: DocumentRecord) {
    const targetStatus = nextStatus[document.status];
    if (targetStatus === document.status) return;

    setDocuments((current) =>
      current.map((item) =>
        item.id === document.id
          ? {
              ...item,
              status: targetStatus,
              lastAction: `Moved to ${targetStatus}`,
              training:
                targetStatus === "Effective" && item.risk !== "Low"
                  ? "Pending"
                  : item.training,
            }
          : item,
      ),
    );
    setAudit((current) => [
      {
        id: `AUD-${1100 + current.length}`,
        action: `Lifecycle moved to ${targetStatus}`,
        actor: document.owner,
        time: "Just now",
        note: `${document.id} advanced from ${document.status} to ${targetStatus}.`,
      },
      ...current,
    ]);
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
      risk: newDoc.risk,
      training: "Not required",
      tags: [newDoc.type, newDoc.department.split(" ")[0]],
      reviewers: ["QA Reviewer"],
      lastAction: "Draft created",
    };

    setDocuments((current) => [created, ...current]);
    setSelectedId(created.id);
    setAudit((current) => [
      {
        id: `AUD-${1100 + current.length}`,
        action: "Document created",
        actor: created.owner,
        time: "Just now",
        note: `${created.id} added as ${created.type} for ${created.department}.`,
      },
      ...current,
    ]);
    setNewDoc({
      title: "",
      type: "SOP",
      department: "Quality Assurance",
      owner: "",
      risk: "Medium",
    });
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#1f2924]">
      <section className="border-b border-[#dfe5dc] bg-[#fbfcf9]">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
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
                Review queue
              </button>
              <button className="inline-flex h-10 items-center gap-2 rounded-md bg-[#173d35] px-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#225347]">
                <FilePlus2 size={16} />
                New document
              </button>
            </div>
          </header>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                className="rounded-lg border border-[#dfe5dc] bg-white p-4 shadow-sm"
                key={metric.label}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[#69756d]">
                    {metric.label}
                  </p>
                  <metric.icon className="text-[#597267]" size={18} />
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-normal text-[#17211d]">
                  {metric.value}
                </p>
                <p className="mt-1 text-sm text-[#69756d]">{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1500px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8">
        <aside className="h-fit rounded-lg border border-[#dfe5dc] bg-white p-3 shadow-sm">
          <nav className="grid gap-1">
            {[
              ["Dashboard", LayoutDashboard],
              ["Document register", FileText],
              ["Lifecycle board", Activity],
              ["Audit trail", History],
              ["Configuration", Settings2],
            ].map(([label, Icon]) => (
              <button
                className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-[#405047] transition hover:bg-[#f2f5ef]"
                key={label as string}
              >
                <Icon size={17} />
                {label as string}
              </button>
            ))}
          </nav>
          <div className="mt-4 rounded-md bg-[#f3f6f1] p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#21372f]">
              <LockKeyhole size={16} />
              Evidence rule
            </div>
            <p className="mt-2 text-sm leading-6 text-[#66736b]">
              Records, status changes, and answers must be traceable to approved
              documents and audit events.
            </p>
          </div>
        </aside>

        <div className="grid gap-5">
          <section className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="rounded-lg border border-[#dfe5dc] bg-white shadow-sm">
              <div className="border-b border-[#e3e8e0] p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#17211d]">
                      Controlled document register
                    </h2>
                    <p className="mt-1 text-sm text-[#69756d]">
                      Search, classify, and track every document from draft to
                      retirement.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex h-10 min-w-[220px] items-center gap-2 rounded-md border border-[#d8dfd6] bg-[#fbfcf9] px-3 text-sm text-[#69756d]">
                      <Search size={16} />
                      <input
                        className="w-full bg-transparent text-[#17211d] outline-none placeholder:text-[#8a968d]"
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search ID, title, owner"
                        value={query}
                      />
                    </label>
                    <label className="flex h-10 items-center gap-2 rounded-md border border-[#d8dfd6] bg-[#fbfcf9] px-3 text-sm text-[#69756d]">
                      <Filter size={16} />
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
                    </label>
                    <label className="flex h-10 items-center gap-2 rounded-md border border-[#d8dfd6] bg-[#fbfcf9] px-3 text-sm text-[#69756d]">
                      <SlidersHorizontal size={16} />
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
                    </label>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] border-separate border-spacing-0 text-left text-sm">
                  <thead>
                    <tr className="text-[#69756d]">
                      {[
                        "Document",
                        "Type",
                        "Owner",
                        "Status",
                        "Review",
                        "Training",
                        "",
                      ].map((heading) => (
                        <th
                          className="border-b border-[#e7ece4] px-4 py-3 font-medium"
                          key={heading}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((document) => (
                      <tr
                        className={`cursor-pointer transition hover:bg-[#f8faf6] ${
                          selectedDocument.id === document.id
                            ? "bg-[#f2f6f1]"
                            : ""
                        }`}
                        key={document.id}
                        onClick={() => setSelectedId(document.id)}
                      >
                        <td className="border-b border-[#edf1ea] px-4 py-3">
                          <p className="font-semibold text-[#17211d]">
                            {document.title}
                          </p>
                          <p className="mt-1 text-xs text-[#69756d]">
                            {document.id} · Rev {document.revision}
                          </p>
                        </td>
                        <td className="border-b border-[#edf1ea] px-4 py-3 text-[#405047]">
                          {document.type}
                        </td>
                        <td className="border-b border-[#edf1ea] px-4 py-3">
                          <p className="text-[#24332d]">{document.owner}</p>
                          <p className="mt-1 text-xs text-[#69756d]">
                            {document.department}
                          </p>
                        </td>
                        <td className="border-b border-[#edf1ea] px-4 py-3">
                          <span
                            className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ring-1 ${statusTone[document.status]}`}
                          >
                            {document.status}
                          </span>
                        </td>
                        <td className="border-b border-[#edf1ea] px-4 py-3 text-[#405047]">
                          {document.nextReview}
                        </td>
                        <td className="border-b border-[#edf1ea] px-4 py-3 text-[#405047]">
                          {document.training}
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
            </div>

            <aside className="grid gap-5">
              <div className="rounded-lg border border-[#dfe5dc] bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#69756d]">
                      Active record
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-[#17211d]">
                      {selectedDocument.id}
                    </h2>
                  </div>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-semibold ring-1 ${statusTone[selectedDocument.status]}`}
                  >
                    {selectedDocument.status}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-7 text-[#17211d]">
                  {selectedDocument.title}
                </h3>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Revision", selectedDocument.revision],
                    ["Type", selectedDocument.type],
                    ["Effective", selectedDocument.effectiveDate],
                    ["Next review", selectedDocument.nextReview],
                    ["Risk", selectedDocument.risk],
                    ["Training", selectedDocument.training],
                  ].map(([label, value]) => (
                    <div className="rounded-md bg-[#f7f9f4] p-3" key={label}>
                      <p className="text-xs font-medium uppercase tracking-normal text-[#7a867e]">
                        {label}
                      </p>
                      {label === "Risk" ? (
                        <span
                          className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${riskTone[value as DocumentRecord["risk"]]}`}
                        >
                          {value}
                        </span>
                      ) : (
                        <p className="mt-1 font-semibold text-[#24332d]">
                          {value}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedDocument.tags.map((tag) => (
                    <span
                      className="rounded-md bg-[#eef3eb] px-2 py-1 text-xs font-medium text-[#536159]"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 rounded-md border border-[#e1e7de] p-3">
                  <p className="text-sm font-semibold text-[#24332d]">
                    Reviewers
                  </p>
                  <div className="mt-2 grid gap-2">
                    {selectedDocument.reviewers.map((reviewer) => (
                      <div
                        className="flex items-center gap-2 text-sm text-[#536159]"
                        key={reviewer}
                      >
                        <UserRoundCheck size={15} />
                        {reviewer}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#173d35] px-3 text-sm font-semibold text-white transition hover:bg-[#225347] disabled:cursor-not-allowed disabled:bg-[#9eaaa4]"
                  disabled={selectedDocument.status === "Retired"}
                  onClick={() => advanceDocument(selectedDocument)}
                >
                  <Check size={16} />
                  Move to {nextStatus[selectedDocument.status]}
                </button>
              </div>

              <div className="rounded-lg border border-[#dfe5dc] bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <FilePlus2 className="text-[#597267]" size={18} />
                  <h2 className="text-lg font-semibold text-[#17211d]">
                    Add document
                  </h2>
                </div>
                <div className="mt-4 grid gap-3">
                  <input
                    className="h-10 rounded-md border border-[#d8dfd6] bg-[#fbfcf9] px-3 text-sm outline-none transition focus:border-[#789085]"
                    onChange={(event) =>
                      setNewDoc((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Document title"
                    value={newDoc.title}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      className="h-10 rounded-md border border-[#d8dfd6] bg-[#fbfcf9] px-3 text-sm outline-none"
                      onChange={(event) =>
                        setNewDoc((current) => ({
                          ...current,
                          type: event.target.value,
                        }))
                      }
                      value={newDoc.type}
                    >
                      {documentTypes.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                    <select
                      className="h-10 rounded-md border border-[#d8dfd6] bg-[#fbfcf9] px-3 text-sm outline-none"
                      onChange={(event) =>
                        setNewDoc((current) => ({
                          ...current,
                          risk: event.target.value as DocumentRecord["risk"],
                        }))
                      }
                      value={newDoc.risk}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <select
                    className="h-10 rounded-md border border-[#d8dfd6] bg-[#fbfcf9] px-3 text-sm outline-none"
                    onChange={(event) =>
                      setNewDoc((current) => ({
                        ...current,
                        department: event.target.value,
                      }))
                    }
                    value={newDoc.department}
                  >
                    {departments.map((department) => (
                      <option key={department}>{department}</option>
                    ))}
                  </select>
                  <input
                    className="h-10 rounded-md border border-[#d8dfd6] bg-[#fbfcf9] px-3 text-sm outline-none transition focus:border-[#789085]"
                    onChange={(event) =>
                      setNewDoc((current) => ({
                        ...current,
                        owner: event.target.value,
                      }))
                    }
                    placeholder="Document owner"
                    value={newDoc.owner}
                  />
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#173d35] px-3 text-sm font-semibold text-white transition hover:bg-[#225347]"
                    onClick={createDocument}
                  >
                    <PenLine size={16} />
                    Create draft
                  </button>
                </div>
              </div>
            </aside>
          </section>

          <section className="grid gap-5 2xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
            <div className="rounded-lg border border-[#dfe5dc] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#17211d]">
                    Lifecycle board
                  </h2>
                  <p className="mt-1 text-sm text-[#69756d]">
                    Every column is a controlled state, not a loose task list.
                  </p>
                </div>
                <Activity className="text-[#597267]" size={20} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {lifecycle.map((status) => {
                  const items = documents.filter(
                    (document) => document.status === status,
                  );
                  return (
                    <div
                      className="min-h-[170px] rounded-lg border border-[#e3e8e0] bg-[#fbfcf9] p-3"
                      key={status}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ring-1 ${statusTone[status]}`}
                        >
                          {status}
                        </span>
                        <span className="text-sm font-semibold text-[#69756d]">
                          {items.length}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2">
                        {items.slice(0, 3).map((document) => (
                          <button
                            className="rounded-md border border-[#e3e8e0] bg-white p-3 text-left shadow-sm transition hover:border-[#c7d2c4]"
                            key={document.id}
                            onClick={() => setSelectedId(document.id)}
                          >
                            <p className="text-sm font-semibold text-[#24332d]">
                              {document.id}
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#69756d]">
                              {document.title}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-[#dfe5dc] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#17211d]">
                    Audit trail
                  </h2>
                  <p className="mt-1 text-sm text-[#69756d]">
                    Controlled actions stay visible and attributable.
                  </p>
                </div>
                <History className="text-[#597267]" size={20} />
              </div>
              <div className="mt-4 grid gap-3">
                {audit.map((entry) => (
                  <div
                    className="rounded-lg border border-[#e3e8e0] bg-[#fbfcf9] p-3"
                    key={entry.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#24332d]">
                          {entry.action}
                        </p>
                        <p className="mt-1 text-xs text-[#69756d]">
                          {entry.actor} · {entry.time}
                        </p>
                      </div>
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-[#69756d]">
                        {entry.id}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#536159]">
                      {entry.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[#dfe5dc] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#17211d]">
                  Dynamic configuration
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[#69756d]">
                  Add new document families without changing the workflow:
                  define type, metadata, reviewer role, review cycle, and
                  training impact.
                </p>
              </div>
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#d8dfd6] bg-[#fbfcf9] px-3 text-sm font-semibold text-[#314039] transition hover:bg-[#f2f5ef]">
                <Settings2 size={16} />
                Manage fields
              </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Document types",
                  value: "8 active",
                  icon: FileClock,
                  copy: "SOP, STP, BMR, protocol, policy, template",
                },
                {
                  label: "Approval routes",
                  value: "Role based",
                  icon: UserRoundCheck,
                  copy: "Owner, reviewer, QA approver, training coordinator",
                },
                {
                  label: "Retention",
                  value: "Lifecycle aware",
                  icon: Archive,
                  copy: "Effective records, obsolete copies, retired versions",
                },
                {
                  label: "Validation ready",
                  value: "Traceable",
                  icon: Sparkles,
                  copy: "Audit events can support future CSV and e-signature",
                },
              ].map((item) => (
                <div
                  className="rounded-lg border border-[#e3e8e0] bg-[#fbfcf9] p-4"
                  key={item.label}
                >
                  <item.icon className="text-[#597267]" size={20} />
                  <p className="mt-3 text-sm font-medium text-[#69756d]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#17211d]">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#69756d]">
                    {item.copy}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
