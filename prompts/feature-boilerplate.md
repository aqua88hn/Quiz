---
agent: 'agent'
model: GPT-4o
tools: ['githubRepo', 'search/codebase']
description: 'Feature boilerplate: route, service, types, validation (Zod), form, page, tests'
---

Goal: generate full-stack boilerplate for a new resource in this repo.

Ask for:
- resource name (kebab-case, e.g., users)
- fields: name:type:default (e.g., name:string:'')
- API methods required (GET,POST,PUT,DELETE)
- Form name (PascalCase) if different

Constraints:
- API route: src/app/api/{resource}/route.ts
- Service: src/lib/services/{resource}.ts
- Types: src/types/{resource}.ts
- Validation (Zod): src/validation/{resource}.ts
- Form: src/components/forms/{FormName}/{FormName}Form.tsx (react-hook-form + zod resolver)
- Page: src/app/{resource}/create/page.tsx
- Tests: src/__tests__/lib/services/{resource}.test.ts and src/__tests__/components/{FormName}Form.test.tsx
- Response shape: { success: boolean, data?: any, error?: string }

Output required:
1) list of files with full paths
2) full file contents ready to paste
3) npm install commands if additional deps required
4) manual test steps: cURL and UI flow
