# Pharma DMS

A focused document management system for pharma teams.

The goal is to make controlled documents easy to create, classify, review, approve, revise, retire, and audit without turning the product into a heavy enterprise suite.

## Initial Product Direction

- Dynamic document types and metadata fields
- Clear document lifecycle tracking
- Revision history and effective/retired status
- Review and approval visibility
- Audit trail for controlled actions
- Professional, simple interface for QA and operations teams

This repository will start with a practical v1 and expand only where the workflow needs it.

## Current Build

This build is a production-shaped frontend DMS prototype built with Next.js, TypeScript, Tailwind CSS, and lucide-react icons.

It includes:

- Dashboard metrics for controlled documents, reviews, training, and periodic review
- Searchable document register with status and type filters
- Dynamic document creation flow for any document type or department
- Controlled lifecycle board from draft through retirement
- Active document detail panel with revision, risk, training, owner, and reviewers
- E-signature workflow with signer, role, signing meaning, password re-entry, reason, timestamp, and hash
- Audit trail for lifecycle, e-signature, and document creation events
- Training impact tracking with completion progress
- Retention and archive view for controlled copies, drafts, and retired records
- Reports surface for inventory, open actions, signature exceptions, and audit exports
- Admin configuration for document types, departments, lifecycle states, roles, and permissions
- Turso/libSQL backend model for documents, versions, users, roles, signatures, training, retention, and audit events
- API routes for document listing/creation, workflow transitions, e-signatures, and database health
- Local browser fallback when the database environment is not configured

## Production Boundary

The interface is designed around pharma/GxP document control expectations, but a regulated production deployment still needs:

- Backend authentication and session management
- File storage with versioned controlled copies
- Role and permission enforcement on the server
- Backup, restore, disaster recovery, and retention execution
- CSV/Part 11 validation package and test evidence

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Database

Create `.env.local` from `.env.example`:

```bash
TURSO_DATABASE_URL=libsql://dms-kskendsup.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=your-token
```

Then run:

```bash
npm run db:migrate
npm run db:seed
```

The app uses Turso through Next.js route handlers. If the env vars are missing, the UI stays usable with local fallback data.

## Validation

```bash
npm run lint
npm run build
```
