# Spec: User Onboarding Validation

## Metadata
- Feature name: User onboarding validation
- Short slug: user-onboarding
- Author: Product Team
- Date: 2025-11-15
- Priority: high
- Related issue/PR: #123
- Owner: @product-owner

## Overview
Implement end-to-end validation for the user onboarding form: client inline validation, server-side business validation, persistence to users table, and tests. Goal: prevent invalid or duplicate accounts and provide clear UX error messages.

## Acceptance Criteria
- [ ] Submitting valid data creates a user and returns 201 with user payload.
- [ ] Client shows inline errors and prevents submit for invalid inputs.
- [ ] Server returns 400 with structured errors for invalid inputs.
- [ ] Duplicate email returns 409 with EMAIL_TAKEN error.
- [ ] Tests cover server unit, API integration, and client validation.

## Inputs
| Field | Type | Required | Constraints / Validation | Transform | Example valid | Example invalid | Exact error message |
|-------|------|----------|--------------------------|-----------|---------------|-----------------|---------------------|
| email | string | yes | RFC email regex; lowercased; unique in users table | trim, toLowerCase | "alice@example.com" | "alice@.com" | "Please enter a valid email address" |
| password | string | yes | min 8 chars, at least 1 number, 1 letter | none | "P@ssw0rd1" | "short" | "Password must be at least 8 characters and include letters and numbers" |
| name | string | yes | min 2, max 100 | trim | "Alice" | "" | "Name is required" |
| age | number | no | integer >= 13 | none | 25 | 10 | "You must be 13 or older to sign up" |
| referralCode | string | no | optional; if present must match pattern ^[A-Z0-9]{6}$ | trim, uppercase | "ABC123" | "abc" | "Invalid referral code" |

## Business Rules (server-side)
1. Validate shape and types strictly; return 400 with field errors if invalid.
2. Ensure email uniqueness; if duplicate, return 409 with error code EMAIL_TAKEN and message "Email already registered".
3. Enforce password strength server-side identical to client rule.
4. If referralCode present, verify code exists and is active in referrals table; if not active, return 400 referral error.
5. Create user record in a transaction; set createdAt, emailVerified=false.
6. Do not auto-login user; return created user id and public fields only.

Error codes:
- INVALID_FIELD — generic invalid input
- EMAIL_TAKEN — duplicate email
- REFERRAL_INVALID — referral present but invalid

## API Contract
- Endpoint: POST /api/onboarding
- Auth: public
- Request payload example:
```json
{
  "email": "alice@example.com",
  "password": "P@ssw0rd1",
  "name": "Alice",
  "age": 25,
  "referralCode": "ABC123"
}
```
- Success response: Status: 201
```json
{
  "id": "user_01F...",
  "email": "alice@example.com",
  "name": "Alice",
  "age": 25
}
```
- Error response format (example): Status: 400
```json
{
  "errors": [
    { "field": "email", "code": "INVALID_FIELD", "message": "Please enter a valid email address" },
    { "field": "password", "code": "INVALID_FIELD", "message": "Password must be at least 8 characters and include letters and numbers" }
  ]
}
```
- Duplicate email: Status: 409
```json
{ "errors": [{ "field": "email", "code": "EMAIL_TAKEN", "message": "Email already registered" }] }
```

## Persistence / DB changes
- Table: users
- Required fields:
  - id (string, PK)
  - email (string, unique, indexed)
  - passwordHash (string)
  - name (string)
  - age (int, nullable)
  - emailVerified (boolean, default false)
  - createdAt (timestamp)

- Prisma model example:
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String
  age           Int?
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
}
```

- Migration notes:
  - Add unique index on email.
  - If adding age column: ensure nullable to avoid breaking existing rows, then backfill if needed.
  - Run: prisma migrate dev --name add-user-age (adjust for your stack).

## Client UI Behavior
- Validation timing: onBlur and onSubmit; realtime hints for password strength.
- Display: inline error under each field; error text must match Spec exactly.
- Submit behavior:
  - Disable submit while form invalid.
  - Disable submit and show spinner while request pending.
- Success UI:
  - On 201, show success toast/modal with instructions to verify email.
  - Clear or reset sensitive fields (password) after success.
- Accessibility:
  - All error messages should be linked via `aria-describedby`.
  - Use semantic HTML inputs and labels.

## Edge Cases & Non-functional Requirements
- Reject payloads larger than 50KB.
- Rate-limit onboarding endpoint: e.g., 5 requests per IP per minute.
- Handle DB unique constraint race: map DB unique violation to EMAIL_TAKEN (409).
- Use constant-time comparisons for sensitive operations.
- Cache/Index referrals lookup for performance; fall back gracefully if cache unavailable.
- Logging: capture validation failures and key metrics (no PII in logs).
- Security: sanitize inputs, enforce HTTPS, and apply CSRF protections as per app conventions.

## Test Cases
### Server unit tests
- valid payload => success and user persisted
- missing required field => 400 with field-specific error
- invalid email format => 400 with email error
- short/weak password => 400 with password error
- age < 13 => 400 with age error
- duplicate email => 409 EMAIL_TAKEN
- invalid referralCode => 400 REFERRAL_INVALID

### API integration tests (with test DB)
- happy path end-to-end
- concurrent duplicate signup attempts -> one 201, others 409
- migration applied and schema works as expected

### Client tests
- inline validation messages appear for invalid inputs
- submit button disabled when form invalid
- spinner shown while request pending
- success UI displayed on 201

## Migration & Rollout Notes
- Create reversible migration that adds/updates `users` table and unique index on `email`.
- Backfill strategy: if adding non-nullable columns, add as nullable then backfill then set NOT NULL.
- Rollout plan:
  1. Deploy DB migration in a maintenance window or with feature flag.
  2. Deploy server code that is backward compatible with old schema where possible.
  3. Monitor signup errors and duplicate key violations.
- Rollback:
  - Provide SQL or prisma rollback steps; ensure you can revert schema safely and document data implications.

## Examples / Flows
### 1. Happy path
- Client: POST /api/onboarding with valid payload
- Server: validate -> create user in transaction -> return 201 with user id/email/name

### 2. Validation failure
- Client: POST with invalid email/password
- Server: return 400 with structured errors
- Client: display inline messages, do not clear other fields

### 3. Duplicate email (race)
- Two concurrent requests same email:
  - One request succeeds (201)
  - Other(s) receive 409 with EMAIL_TAKEN
- Server should handle DB unique constraint and map to 409

## Open Questions
- Should the system auto-send verification email on creation, or is that handled by a separate job?
- Should signups require captcha for production?
- What is the desired behavior for partial backfill of `age` if missing historical data?
- Are there specific logging/observability requirements or telemetry keys to include?

## Checklist for PR
- [ ] Spec referenced: `docs/specs/onboarding-validation.md`
- [ ] Server validation functions added and unit tested
- [ ] API handler updated; integration tests added
- [ ] Client validation updated and unit tested
- [ ] DB migration included (if required)
- [ ] README/docs updated to reflect behavior
- [ ] Lint and format pass
- [ ] CI tests pass
- [ ] Draft PR created on branch `copilot/feature/validate-user-onboarding`
- [ ] Open Questions section included (if any)
