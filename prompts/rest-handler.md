---
agent: 'agent'
model: GPT-4o
tools: ['search/codebase']
description: 'Generate Next.js App Router API route + service using Zod'
---

Goal: create API route and service using Zod validation.

Ask for: resource, methods.

Constraints:
- Route: src/app/api/{resource}/route.ts
- Service: src/lib/services/{resource}.ts
- Validation: src/validation/{resource}.ts (Zod schemas)
- Types in src/types/{resource}.ts
- Error format per OPERATIONAL_GUIDE (requestId, status, error, message, details)
- Return JSON { success, data, error }
