# QuizMate - Quick Reference

## Địa chỉ quan trọng

| URL | Mục đích | Login cần |
|-----|---------|----------|
| `http://localhost:3000` | Homepage - Danh sách quiz | Không |
| `http://localhost:3000/quiz/python_keywords_expert` | Làm quiz Python Keywords | Không |
| `http://localhost:3000/quiz/[id]/result` | Xem kết quả | Không |
| `http://localhost:3000/quiz/[id]/review` | Review câu trả lời | Không |
| `http://localhost:3000/admin/login` | Admin login | Password: `admin123` |
| `http://localhost:3000/admin` | Admin dashboard | Sau login |
| `http://localhost:3000/api/health` | Health check | Không |
| `http://localhost:3000/api/v1/quizzes` | Fetch all quizzes | Không |

## Folder Files Quan Trọng

| Path | Mục đích |
|------|---------|
| `app/page.tsx` | Homepage |
| `app/quiz/[id]/page.tsx` | Quiz page |
| `app/quiz/[id]/result/page.tsx` | Result screen |
| `app/quiz/[id]/review/page.tsx` | Review page |
| `app/admin/page.tsx` | Admin dashboard |
| `app/admin/login/page.tsx` | Admin login |
| `app/api/v1/quizzes/route.ts` | GET all quizzes |
| `app/api/v1/quizzes/[id]/route.ts` | GET quiz detail |
| `app/api/v1/quizzes/[id]/submit/route.ts` | POST submit answers |
| `lib/db.ts` | Database (mock data) |
| `lib/auth.ts` | Authentication |
| `lib/quiz-service.ts` | API client |
| `components/` | React components |

## NPM Scripts

```bash
npm run dev           # Chạy dev server (port 3000)
npm run build         # Build for production
npm start             # Chạy production build
npm test              # Chạy unit tests
npm run test:watch    # Tests (auto-reload)
npm run test:coverage # Coverage report
npm run lint          # Code linting
```

## Database Schema (Quick View)

### Bảng `quizzes`
```sql
- id (PRIMARY KEY)
- title
- description
- questionCount
- difficulty
```

### Bảng `questions`
```sql
- id (PRIMARY KEY)
- quizId (FOREIGN KEY)
- question
- options (JSON array)
- answer (JSON array of indices)
- explanation
- type (singleSelect|multiSelect)
```

### Bảng `user_sessions` (optional)
```sql
- id (PRIMARY KEY)
- userId
- quizId
- answers (JSON)
- score
- createdAt
```

## Mock Data Locations

- Quizzes: `lib/db.ts` → `const quizzes: Quiz[]`
- Questions: `lib/db.ts` → `const questions: Question[]`
- Data functions: `lib/db.ts` → `getQuizzes()`, `getQuestionsByQuizId()`, etc.

## Environment Variables

```bash
# .env.local
JWT_SECRET="secret-key-32-chars-min"
ADMIN_PASSWORD="admin123"
DATABASE_URL="postgresql://..." # Optional
```

## Test Command Examples

```bash
# Run all tests
npm test

# Run specific test file
npm test __tests__/score-calculation.test.ts

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## API Request Examples

### GET all quizzes
```bash
curl http://localhost:3000/api/v1/quizzes
```

### GET quiz with questions
```bash
curl http://localhost:3000/api/v1/quizzes/python_keywords_expert
```

### POST submit answers
```bash
curl -X POST http://localhost:3000/api/v1/quizzes/python_keywords_expert/submit \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"questionId": "q1", "selected": [1]},
      {"questionId": "q2", "selected": [0]}
    ]
  }'
```

### Admin login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password": "admin123"}'
```

## Technologies

- **Frontend**: React 19, Next.js 16, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI
- **Forms**: React Hook Form, Zod validation
- **Testing**: Jest, ts-jest
- **Database**: PostgreSQL (Neon) or Mock data
- **Auth**: JWT tokens (Base64 encoded)
