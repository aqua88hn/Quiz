---
agent: 'agent'
model: GPT-4o
tools: ['search/codebase']
description: 'Create React Hook Form component using Zod'
---

Goal: create a React form using react-hook-form + zod resolver, uncontrolled via register, with defaultValues.

Ask for: FormName, fields (name:type:default), submit endpoint.

Constraints:
- Use Zod schema imported from src/validation/{resource}.ts
- Type export: type {FormName}Input
- File path: src/components/forms/{FormName}/{FormName}Form.tsx
- Use @hookform/resolvers/zod
- Show how to call API (fetch) on submit and redirect on success
