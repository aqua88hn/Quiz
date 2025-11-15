# Agent Request Template (fill and paste into Agent input)

Task: Implement end-to-end validation for feature "<feature-name>" per attached Spec "<spec-file-name.md>".

Attached Spec: <spec-file-name.md> (path in repo)

Repository notes:
- Tech stack: Next.js (App Router), React, TypeScript, Prisma (or repo-specific DB layer)
- Form component to update: <path/to/form/component>
- Server handler to update: <path/to/api/handler or app/api route>
- DB module/schema: <path/to/db/module or prisma/schema.prisma>

Required outputs:
1. Client validation with inline errors matching Spec.
2. Server validation functions and API update returning structured errors.
3. DB changes/migrations if required.
4. Tests: server unit, API integration, client unit.
5. Draft PR on branch copilot/feature/validate-<feature-name>.

Priority: <high|medium|low>
Deadline (optional): <YYYY-MM-DD>

Important: If Spec ambiguous, stop and list questions. Do not change files outside allowed scope.