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

## Current V1

This first version is a frontend DMS prototype built with Next.js, TypeScript, Tailwind CSS, and lucide-react icons.

It includes:

- Dashboard metrics for controlled documents, reviews, training, and periodic review
- Searchable document register with status and type filters
- Dynamic document creation flow for any document type
- Controlled lifecycle board from draft through retirement
- Active document detail panel with revision, risk, training, owner, and reviewers
- Audit trail for lifecycle and document creation events
- Configuration preview for document types, approval routes, retention, and validation readiness

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run build
```
