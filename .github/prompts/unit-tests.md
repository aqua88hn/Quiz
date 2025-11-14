---
agent: 'agent'
model: GPT-4o
tools: ['search/codebase']
description: 'Generate Jest unit tests for service and React form'
---

Goal: create deterministic unit tests for the service functions and form component.

Ask for: module paths, behaviors to test.

Constraints:
- Use Jest + @testing-library/react
- Mock network/service calls with jest.mock
- Place tests under src/__tests__/
