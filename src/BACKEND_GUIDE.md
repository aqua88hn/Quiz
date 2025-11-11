# QuizMate Backend Documentation

## Backend Architecture Overview

QuizMate backend uses **Next.js API Routes** (Serverless Functions) as the REST API layer. The current implementation uses an in-memory mock database, but can be easily upgraded to PostgreSQL.

## Current Backend Structure

```
app/api/
├── health/
│   └── route.ts                 # Health check endpoint
└── v1/
    ├── auth/
    │   └── login/
    │       └── route.ts         # Admin login
    └── quizzes/
        ├── route.ts             # GET all quizzes
        ├── [id]/
        │   ├── route.ts         # GET specific quiz with questions
        │   └── submit/
        │       └── route.ts     # POST submit answers & calculate score
```

## API Endpoints

### Public Endpoints (No Auth Required)

#### 1. GET /api/v1/quizzes
**Description:** Fetch all available quizzes

**Request:**
```bash
curl http://localhost:3000/api/v1/quizzes
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "python_keywords_expert",
      "title": "Python Keywords Expert",
      "description": "Advanced questions on Python reserved keywords",
      "questionCount": 5,
      "difficulty": "Expert"
    },
    {
      "id": "python_basics",
      "title": "Python Basics",
      "description": "Fundamental concepts of Python programming",
      "questionCount": 5,
      "difficulty": "Beginner"
    }
  ]
}
```

---

#### 2. GET /api/v1/quizzes/:quizId
**Description:** Get quiz details with all questions

**Request:**
```bash
curl http://localhost:3000/api/v1/quizzes/python_basics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "python_basics",
    "title": "Python Basics",
    "description": "Fundamental concepts of Python programming",
    "questionCount": 5,
    "difficulty": "Beginner",
    "questions": [
      {
        "id": "q6",
        "question": "Cách nào để tạo một danh sách trong Python?",
        "options": ["{}", "[]", "()", "list()"],
        "answer": [1, 3],
        "type": "multiSelect",
        "explanation": "Cả [] và list() đều có thể được sử dụng để tạo một danh sách trong Python.",
        "quizId": "python_basics"
      },
      {
        "id": "q7",
        "question": "Hàm nào được sử dụng để lấy độ dài của một danh sách?",
        "options": ["size()", "length()", "len()", "count()"],
        "answer": [2],
        "type": "singleSelect",
        "explanation": "Hàm len() được sử dụng để lấy độ dài của một danh sách trong Python.",
        "quizId": "python_basics"
      }
    ]
  }
}
```

---

#### 3. POST /api/v1/quizzes/:quizId/submit
**Description:** Submit quiz answers and get scored results

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/quizzes/python_basics/submit \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "questionId": "q6",
        "selected": [1, 3]
      },
      {
        "questionId": "q7",
        "selected": [2]
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scorePercent": 100,
    "correctCount": 2,
    "total": 2,
    "details": [
      {
        "questionId": "q6",
        "correct": true,
        "correctOptions": [1, 3],
        "explanation": "Cả [] và list() đều có thể được sử dụng để tạo một danh sách trong Python."
      },
      {
        "questionId": "q7",
        "correct": true,
        "correctOptions": [2],
        "explanation": "Hàm len() được sử dụng để lấy độ dài của một danh sách trong Python."
      }
    ]
  }
}
```

---

### Admin Endpoints (JWT Auth Required)

#### 4. POST /api/v1/auth/login
**Description:** Admin login with password

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password": "admin123"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "YWRtaW46YWRtaW4xMjM="
  }
}
```

---

#### 5. GET /api/health
**Description:** Health check endpoint

**Request:**
```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Backend Code Locations

### 1. **Database Layer** (`lib/db.ts`)
Mock in-memory database with:
- `quizzes[]` - Array of quiz objects
- `questions[]` - Array of question objects
- Functions:
  - `getQuizzes()` - Return all quizzes
  - `getQuizById(id)` - Get single quiz
  - `getQuestionsByQuizId(quizId)` - Get questions for a quiz
  - `getQuestionById(id)` - Get single question
  - `submitAnswers(quizId, answers)` - Calculate score

**File Location:** `/lib/db.ts`

### 2. **Quiz Service** (`lib/quiz-service.ts`)
Client-side service that calls API endpoints:
- `fetchQuizzes()` - GET /api/v1/quizzes
- `fetchQuizById(id)` - GET /api/v1/quizzes/[id]
- `submitQuizAnswers(quizId, answers)` - POST /api/v1/quizzes/[id]/submit

**File Location:** `/lib/quiz-service.ts`

### 3. **Auth Module** (`lib/auth.ts`)
Authentication utilities:
- `generateToken(role)` - Create JWT token
- `validateAdminPassword(password)` - Check admin password
- `validateToken(token)` - Verify JWT token

**File Location:** `/lib/auth.ts`

### 4. **API Routes**

| Route | Code Location | Description |
|-------|---------------|-------------|
| GET /api/v1/quizzes | `app/api/v1/quizzes/route.ts` | Fetch all quizzes |
| GET /api/v1/quizzes/:id | `app/api/v1/quizzes/[id]/route.ts` | Fetch quiz with questions |
| POST /api/v1/quizzes/:id/submit | `app/api/v1/quizzes/[id]/submit/route.ts` | Submit answers & calculate score |
| POST /api/v1/auth/login | `app/api/v1/auth/login/route.ts` | Admin login |
| GET /api/health | `app/api/health/route.ts` | Health check |

---

## Backend Technology Stack

- **Runtime:** Node.js (Vercel Serverless Functions)
- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Database:** SQLite/PostgreSQL (currently mock in-memory)
- **Authentication:** JWT (Base64 encoded tokens)
- **Validation:** Manual validation (can upgrade to Zod/Yup)

---

## Key Implementation Details

### Score Calculation Logic

**Location:** `lib/db.ts` - `submitAnswers()` function

**Algorithm:**
1. Compare user's selected answers with correct answers
2. For single-select: user answer must match exactly
3. For multi-select: both arrays must contain same values (order-independent)
4. Calculate percentage: `(correctCount / totalQuestions) * 100`
5. Return detailed results with explanations

**Example:**
```typescript
const isCorrect = 
  selected.length === expected.length && 
  selected.every((v, i) => v === expected[i])
```

---

## Database Schema (PostgreSQL)

See `POSTGRES_SCHEMA.md` for complete schema migration files.

---

## How to Test Backend

### 1. Local Testing
```bash
npm run dev
# Server runs on http://localhost:3000
```

### 2. Using cURL
```bash
# Test GET /api/v1/quizzes
curl http://localhost:3000/api/v1/quizzes

# Test GET /api/v1/quizzes/python_basics
curl http://localhost:3000/api/v1/quizzes/python_basics

# Test POST submit
curl -X POST http://localhost:3000/api/v1/quizzes/python_basics/submit \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"questionId":"q6","selected":[1,3]}]}'

# Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}'
```

### 3. Using Postman/Insomnia
Import the requests from above and test all endpoints.

### 4. Running Tests
```bash
npm test
# Tests are in __tests__/score-calculation.test.ts
```

---

## Migration from Mock DB to PostgreSQL

To upgrade from mock in-memory database to PostgreSQL:

1. **Create tables** using schema in `POSTGRES_SCHEMA.md`
2. **Install `@neondatabase/serverless`** or similar
3. **Update `lib/db.ts`** to use database queries instead of arrays
4. **Update environment variables** with DATABASE_URL
5. **Run migrations** to populate seed data
6. **Test all API endpoints** to ensure they work with real database

See `POSTGRES_SCHEMA.md` for detailed implementation.
