---
agent: 'agent'
model: GPT-4o
tools: ['githubRepo', 'search/codebase']
description: 'Feature boilerplate: route, service, types, validation (Zod), form, page, tests'
---

### Action (required)
- Use the `githubRepo` tool to create and commit the files described below at the specified `Path:` locations in the repository.
- Commit message: "feat: add {resource} boilerplate"
- If a target file already exists, follow this conflict policy:
  - Safe mode (default): Do NOT overwrite. Instead create a new file with suffix `.new` (e.g., `myfile.ts.new`) and report the conflict in the response.
  - Overwrite mode (opt-in): Back up the existing file by copying it to `<filename>.bak` before overwriting.
- After creating or modifying files, list the created/modified file paths and include a short summary (1–2 lines) for each file.
- If preview is requested, first output a short preview (first ~20 lines) of each file to be created. Only apply changes after explicit confirmation.

## Updated Guidelines for Feature Boilerplate

### Goal
Generate full-stack boilerplate for a new resource in this repo.

### Ask for:
- **Resource Name**: (kebab-case, e.g., `users`)
- **Fields**: `name:type:default` (e.g., `name:string:''`)
- **API Methods Required**: (e.g., `GET`, `POST`, `PUT`, `DELETE`)
- **Form Name**: (PascalCase, e.g., `UserEdit`) if different from the resource name

### Constraints:
- TypeScript, use existing db connection getPool() (project-specific)
- Use Zod for validation
- Tailwind CSS class standards
- Reuse components in components/ui where possible

#### API Route
- Path: `src/app/api/{resource}/route.ts`
- Use `getPool()` from `db-connection.ts` for all database operations.
- Ensure all `PUT` and `DELETE` methods validate the presence of `id`.
- Example:
  ```typescript
  import { getPool } from '@/lib/db-connection';

  export async function PUT(req: Request) {
    const pool = getPool();
    const { id, name } = await req.json();
    if (!id) throw new Error('ID is required for updates');
    const result = await pool.query(
      `UPDATE {resource} SET name = $1 WHERE id = $2 RETURNING *`,
      [name, id]
    );
    return NextResponse.json({ success: true, data: result.rows[0] });
  }
  ```

#### Service
- Path: `src/lib/services/{resource}.ts`
- Use `getPool()` for database queries.
- Ensure all queries use parameterized SQL to prevent SQL Injection.
- Example:
  ```typescript
  import { getPool } from '@/lib/db-connection';

  export async function updateResource(id: string, updates: Partial<{ name: string }>) {
    const pool = getPool();
    if (!id) throw new Error('ID is required for updates');
    const result = await pool.query(
      `UPDATE {resource} SET name = COALESCE($2, name) WHERE id = $1 RETURNING *`,
      [id, updates.name || null]
    );
    return result.rows[0];
  }
  ```

#### Types
- Path: `src/types/{resource}.ts`
- Define TypeScript types for the resource.

#### Validation
- Path: `src/validation/{resource}.ts`
- Use Zod for schema validation.
- Ensure `id` is validated for `PUT` and `DELETE` methods.
- Example:
  ```typescript
  import { z } from 'zod';

  export const resourceSchema = z.object({
    id: z.string().min(1, 'ID is required').optional(),
    name: z.string().min(1, 'Name is required'),
  });
  ```

#### Form
- Path: `src/components/forms/{FormName}/{FormName}Form.tsx`
- Use `react-hook-form` with `zodResolver` for validation.
- Include a hidden `id` field for `PUT` operations.
- Example:
  ```typescript
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register('id')} type="hidden" />
    <input {...register('name')} />
  </form>
  ```

#### Page
- Path: `src/app/{resource}/edit/page.tsx`
- Include a form for editing the resource.
- Ensure the page is marked with the `"use client"` directive if using `useRouter`.

#### Tests
- Service Tests: `src/__tests__/lib/services/{resource}.test.ts`
  - Mock `getPool()` to isolate database logic.
- Form Tests: `src/__tests__/components/{FormName}Form.test.tsx`

### 1. Tailwind CSS Standards
- All components must adhere to Tailwind CSS utility classes for styling.
- Follow the structure and conventions demonstrated in the provided examples (e.g., `admin-question-card.tsx`, `quiz-card.tsx`, `question-form.tsx`).
- Use consistent spacing, typography, colors, and hover effects.

### 2. Component Organization
- Group components by feature in the `components/{feature-name}` folder.
- For admin-specific features, prefix component names with `admin-` (e.g., `admin-question-card.tsx`).
- Ensure proper folder structure to maintain clarity and scalability.

### 3. Reusable UI Components
- Leverage reusable components from the `components/ui` directory wherever applicable.
  - Examples: `Button`, `Card`, `Modal`, etc.
- Avoid duplicating UI logic; use existing components to ensure consistency.

### 4. Code Structure
- Use functional components with TypeScript for type safety.
- Define clear and reusable interfaces for props.
- Ensure components are modular and reusable.

### 5. Testing and Validation
- Write unit tests for all components to ensure functionality.
- Validate that components render correctly with different props.
- Test admin-specific components for role-based functionality.

### 6. Examples
#### Admin Question Card
```tsx
"use client";

interface AdminQuestionCardProps {
  question: {
    id: string;
    question: string;
    options: string[];
    answer: number[];
    type: string;
    explanation: string;
  };
  index: number;
}

export function AdminQuestionCard({ question, index }: AdminQuestionCardProps) {
  return (
    <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            {index + 1}. {question.question}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {question.options.map((option, idx) => (
          <div
            key={idx}
            className={`p-2 text-sm rounded ${
              question.answer.includes(idx)
                ? 'bg-emerald-900 text-emerald-100'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {option}
            {question.answer.includes(idx) && ' ✓'}
          </div>
        ))}
      </div>

      <div className="bg-slate-700 p-3 rounded mb-3">
        <p className="text-xs text-slate-400 mb-1">Explanation</p>
        <p className="text-sm text-slate-200">{question.explanation}</p>
      </div>

      <div className="flex gap-2">
        <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
          {question.type === 'multiSelect' ? 'Multi-select' : 'Single-select'}
        </span>
      </div>
    </div>
  );
}
```

#### Quiz Card
```tsx
interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    description: string;
    questionCount: number;
    difficulty: string;
  };
}

export function QuizCard({ quiz }: QuizCardProps) {
  return (
    <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer">
      <h3 className="text-xl font-semibold text-white mb-2">{quiz.title}</h3>
      <p className="text-slate-400 text-sm mb-4">{quiz.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-slate-500 text-sm">{quiz.questionCount} questions</span>
        <span
          className={`px-3 py-1 rounded text-sm font-medium ${
            quiz.difficulty === 'Expert' ? 'bg-red-900 text-red-100' : 'bg-blue-900 text-blue-100'
          }`}
        >
          {quiz.difficulty}
        </span>
      </div>
    </div>
  );
}
```

### 7. Additional Notes
- Ensure all components are responsive and accessible.
- Follow best practices for performance optimization.
- Document all components and their props in the `README.md` file for the feature.
