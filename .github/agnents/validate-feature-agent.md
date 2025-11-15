# Agent Instruction: Implement Validation Logic (UI + Backend + DB)

## Goal
Implement input validation end-to-end for an existing feature according to the attached specification document (the "Spec"). This includes:
- Client-side UI validation (inline errors, prevent submit).
- Server-side business validation strictly based on the Spec.
- Persisting validated results to the database.
- Adding/updating automated tests and documentation.
- Creating a draft PR with details and unresolved questions (if any).

## Scope
Allowed edits:
- /app, /components, /app/api or /api, /lib, /db or /prisma, /tests or /__tests__, README, docs/

Forbidden edits:
- .github/workflows, deploy scripts, package.json deps (unless authorized), secrets, files outside allowed paths.

## Behavior Rules
1. Read the attached Spec and extract precise input fields, validation rules, error messages, and persistence behavior. Use the Spec as the single source of truth.
2. Implement server-side validation that is equal or stricter than client-side validation.
3. Implement client-side validation to provide immediate feedback and use exact messages from Spec.
4. Write tests first (server unit, API integration, client unit). Implement code to make tests pass.
5. Follow repo lint/format rules. Run lint/format before PR.
6. Use existing DB access layer; if missing, create a small helper under /lib and document it.
7. Create branch: `copilot/feature/validate-<short-feature-name>`.
8. Commit granularly. Create a draft PR (do not merge).
9. If Spec ambiguous, do NOT guess. Stop and list Questions in PR.
10. Update README/docs explaining rules and how to run tests.

## Success Criteria
- All tests pass locally (`yarn test` or `npm test`).
- Lint/format pass.
- API returns proper status codes and JSON errors.
- Client shows inline errors and prevents invalid submission.
- DB persisted data matches Spec.
- Draft PR created with summary, tests, and unresolved questions (if any).

## Step-by-step Tasks
1. Read Spec, extract fields/constraints/messages and include a structured summary in the PR.
2. Locate UI form and server handler; list file paths in PR.
3. Create tests (server unit, API integration, client unit).
4. Implement server validation functions under /lib/validation or existing layer.
5. Update API handler: validate early, return `{ errors: [...] }` for 4xx, persist valid data transactionally.
6. Implement/update client validation (validate on submit, inline messages, disable submit when invalid).
7. Add DB migrations if required.
8. Run tests and iterate until passing.
9. Format & lint.
10. Create branch, push, open draft PR with required PR checklist.

## PR Checklist (include in PR description)
- Short summary + link to Spec.
- Extracted validation rules table.
- Files changed list with reason.
- Tests added and how to run them.
- Commands to run locally.
- Migration notes and rollback instructions.
- Backward-compatibility notes.
- Unresolved questions.

## Error payload format (default)
```json
{ "errors": [{ "field": "string", "code": "string", "message": "string" }] }
```

## Commands agent will run (include in PR)
- yarn install
- yarn dev
- yarn test
- yarn lint
- yarn format
- prisma migrate dev (if using Prisma)

## Failure / Ambiguity procedure
- Stop, add Questions block to PR with failing tests if Spec ambiguous.
- Do not change files outside allowed scope without approval.

## User-Facing Request Template (use this to instruct agent)
- Task: Implement end-to-end validation for feature "<feature-name>" per attached Spec "<spec-file-name.md>".
- Attached Spec: <spec-file-name.md>
- Repository notes:
  - Tech stack: Next.js (App Router), React, TypeScript, Prisma (or repo-specific DB layer)
  - Form component to update: <path/to/form/component>
  - Server handler to update: <path/to/api/handler or app/api route>
  - DB module/schema: <path/to/db/module or prisma/schema.prisma>

- Required outputs:
  1. Client validation with inline error messages matching Spec.
  2. Server-side validation functions and API update returning structured errors.
  3. DB changes/migrations if required.
  4. Tests: server unit tests, API integration tests, client validation tests.
  5. Draft PR on branch copilot/feature/validate-<feature-name>.

- Priority: <high|medium|low>
- Deadline (optional): <YYYY-MM-DD>
- Important: If the Spec is ambiguous, stop and list questions in the PR. Do not change files outside allowed scope.