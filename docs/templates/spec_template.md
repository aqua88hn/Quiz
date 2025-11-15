# Spec Template

## Metadata
- Feature name: 
- Short slug: 
- Author: 
- Date: YYYY-MM-DD
- Priority: (high | medium | low)
- Related issue/PR: 
- Owner (person to ask):

## Overview
One-paragraph description of goal and business motivation.

## Acceptance Criteria
List clear, testable acceptance criteria. Example:
- [ ] Successful submit persists record and returns 201 with expected body
- [ ] Client shows inline errors and prevents submit on invalid input
- [ ] All specified server validations implemented and tested

## Inputs (required)
| Field | Type | Required | Constraints / Validation | Transform | Example valid | Example invalid | Exact error message |
|-------|------|----------|--------------------------|-----------|---------------|-----------------|---------------------|
| name  | string | yes | min 2, max 100 chars | trim | "Alice" | "" | "Name is required" |

(Repeat row per field)

## Business Rules (server-side)
Ordered list of server-side validations and business logic (authoritative):
1. Rule 1 (e.g., email must be unique; check DB)
2. Rule 2 (cross-field constraints)
3. Rule N (rate-limit / quota checks)

Include error code strings if needed:
- EMAIL_TAKEN — "Email already registered"

## API Contract
- Endpoint: /api/<path>
- Method: POST | PUT | PATCH | …
- Auth: none | user | admin
- Request payload example:
```json
{ "email": "a@b.com", "name": "Alice", "age": 25 }
```
  - Success response (status & body example): Status: 201
  ```json
  { "id": "user_123", "email": "a@b.com", "name": "Alice" }
  ```
  - Error response format (required):
    - Status: 400 (or other)
    ```json
    { "errors": [{ "field": "email", "code": "INVALID_EMAIL", "message": "Please enter a valid email address" }] }
    ```

## Persistence / DB changes
- Tables / collections to update: users
- Columns / fields: users.email (unique), users.name, users.age
- Migration notes: add column age INT NULL (if needed). Include SQL or Prisma change example.
- Transactional needs: describe if multiple writes should be in a transaction.

## Client UI Behavior
- Validation timing: onBlur, onSubmit, realtime (choose)
- Display: inline under field; exact wording must match Spec
- Disabled state: disable submit while invalid or while pending request
- Loading indicator: show spinner on submit

## Edge Cases & Non-functional Requirements
- Max payload size
- Concurrency: optimistic locking? unique constraint handling
- Security: input sanitization, RBAC checks
- Performance constraints (if any)

## Test Cases (required)
List test cases to implement:
- Server unit tests:
  - valid payload => success and persisted
  - missing required field => error payload with field message
  - invalid format => specific error codes
  - duplicate key => EMAIL_TAKEN error

- API integration tests:
  - end-to-end with test DB; success and failure cases

- Client unit tests:
  - show inline messages; block submit; UX states

## Migration & Rollout Notes
- If DB migration: describe apply/rollback commands
- Backfill instructions (if any)
- Compatibility considerations (older clients)

## Examples / Flows
- Happy path: request -> validation -> persist -> 201
- Validation failure: request -> 400 with structured errors
- Race condition: two requests with same email -> one succeeds, other returns EMAIL_TAKEN

## Open Questions
- List ambiguities that need decisions by owner.

## Checklist for PR (to be filled by implementer)
- [ ] Tests added
- [ ] API contract updated (OpenAPI / docs)
- [ ] Migration included (if required)
- [ ] README/docs updated