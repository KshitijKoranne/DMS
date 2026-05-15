import type { Role } from "./dms-types";

export type DmsUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
};

export const roleDescriptions: Record<Role, string> = {
  "Document Owner": "Creates drafts, owns content, and responds to review comments.",
  "Technical Reviewer": "Reviews assigned documents for technical correctness.",
  "QA Approver": "Approves controlled documents, releases copies, and retires records.",
  "Training Coordinator": "Assigns and closes read-and-understand training impact.",
  "System Admin": "Maintains master data, roles, lifecycle rules, and access setup.",
};

export const dmsUsers: DmsUser[] = [
  {
    id: "user_aarav_mehta",
    name: "Aarav Mehta",
    email: "aarav.mehta@example.test",
    role: "Document Owner",
    department: "Quality Assurance",
  },
  {
    id: "user_neha_iyer",
    name: "Neha Iyer",
    email: "neha.iyer@example.test",
    role: "Document Owner",
    department: "Quality Control",
  },
  {
    id: "user_rohan_shah",
    name: "Rohan Shah",
    email: "rohan.shah@example.test",
    role: "Document Owner",
    department: "Manufacturing",
  },
  {
    id: "user_mira_kapoor",
    name: "Mira Kapoor",
    email: "mira.kapoor@example.test",
    role: "Document Owner",
    department: "Validation",
  },
  {
    id: "user_priya_nair",
    name: "Priya Nair",
    email: "priya.nair@example.test",
    role: "QA Approver",
    department: "Quality Assurance",
  },
  {
    id: "user_dev_sen",
    name: "Dev Sen",
    email: "dev.sen@example.test",
    role: "Technical Reviewer",
    department: "Quality Control",
  },
  {
    id: "user_leena_rao",
    name: "Leena Rao",
    email: "leena.rao@example.test",
    role: "Training Coordinator",
    department: "Quality Assurance",
  },
  {
    id: "user_isha_menon",
    name: "Isha Menon",
    email: "isha.menon@example.test",
    role: "System Admin",
    department: "IT Quality",
  },
];
