# PostgreSQL Schema for QuizMate

This document provides the complete PostgreSQL database schema for QuizMate backend.

## Schema Overview

```sql
-- Quizzes Table
CREATE TABLE quizzes (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  question_count INT DEFAULT 0,
  difficulty VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions Table
CREATE TABLE questions (
  id VARCHAR(255) PRIMARY KEY,
  quiz_id VARCHAR(255) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,  -- JSON array: ["option1", "option2", ...]
  answer JSONB NOT NULL,   -- JSON array of indices: [0] or [1, 3]
  explanation TEXT,
  type VARCHAR(50) NOT NULL,  -- "singleSelect" or "multiSelect"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- User Sessions (Optional - for tracking quiz attempts)
CREATE TABLE user_sessions (
  id VARCHAR(255) PRIMARY KEY,
  quiz_id VARCHAR(255) NOT NULL REFERENCES quizzes(id),
  answers JSONB NOT NULL,  -- JSON object: {questionId: selected: []}
  score_percent INT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_sessions_quiz_id ON user_sessions(quiz_id);
CREATE INDEX idx_sessions_created ON user_sessions(created_at DESC);
```

## Step-by-Step Schema Creation

### Step 1: Create Quizzes Table

```sql
CREATE TABLE quizzes (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  question_count INT DEFAULT 0,
  difficulty VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 2: Create Questions Table

```sql
CREATE TABLE questions (
  id VARCHAR(255) PRIMARY KEY,
  quiz_id VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  answer JSONB NOT NULL,
  explanation TEXT,
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);
```

### Step 3: Create Indexes

```sql
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
```

### Step 4: Create User Sessions Table (Optional)

```sql
CREATE TABLE user_sessions (
  id VARCHAR(255) PRIMARY KEY,
  quiz_id VARCHAR(255) NOT NULL,
  answers JSONB NOT NULL,
  score_percent INT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_created ON user_sessions(created_at DESC);
```

## Seed Data

### Insert Sample Quizzes

```sql
INSERT INTO quizzes (id, title, description, question_count, difficulty) VALUES
('python_keywords_expert', 'Python Keywords Expert', 'Advanced questions on Python reserved keywords', 5, 'Expert'),
('python_basics', 'Python Basics', 'Fundamental concepts of Python programming', 5, 'Beginner');
```

### Insert Sample Questions

```sql
INSERT INTO questions (id, quiz_id, question, options, answer, explanation, type) VALUES
(
  'q1',
  'python_keywords_expert',
  'Từ khóa nào dùng để định nghĩa một hàm trong Python?',
  '["function", "def", "lambda", "define"]',
  '[1]',
  'Từ khóa "def" được sử dụng để định nghĩa một hàm trong Python.',
  'singleSelect'
),
(
  'q2',
  'python_keywords_expert',
  'Từ khóa nào dùng để tạo một hàm bất động bộ?',
  '["async", "await", "def", "thread"]',
  '[0]',
  'Từ khóa "async" được sử dụng để định nghĩa một hàm bất động bộ trong Python.',
  'singleSelect'
),
(
  'q3',
  'python_keywords_expert',
  'Từ khóa "yield" thường được dùng trong loại hàm nào?',
  '["Hàm bình thường", "Generator", "Hàm lambda", "Async function"]',
  '[1]',
  '"yield" được sử dụng trong các hàm generator để trả về các giá trị một lần một.',
  'singleSelect'
),
(
  'q4',
  'python_keywords_expert',
  'Cách nào để tạo một hàm với số lượng đối số không xác định?',
  '["*args", "**kwargs", "Cả hai *args và **kwargs", "Không thể làm được"]',
  '[0, 1]',
  'Cả *args và **kwargs đều có thể được sử dụng để tạo hàm với số lượng đối số không xác định.',
  'multiSelect'
),
(
  'q5',
  'python_keywords_expert',
  'Từ khóa nào dùng để xử lý ngoại lệ trong Python?',
  '["try-catch", "try-except", "error-handle", "handle-error"]',
  '[1]',
  'Từ khóa "try-except" được sử dụng để xử lý ngoại lệ trong Python.',
  'singleSelect'
),
(
  'q6',
  'python_basics',
  'Cách nào để tạo một danh sách trong Python?',
  ['{}', '[]', '()', 'list()']',
  '[1, 3]',
  'Cả [] và list() đều có thể được sử dụng để tạo một danh sách trong Python.',
  'multiSelect'
),
(
  'q7',
  'python_basics',
  'Hàm nào được sử dụng để lấy độ dài của một danh sách?',
  '["size()", "length()", "len()", "count()"]',
  '[2]',
  'Hàm len() được sử dụng để lấy độ dài của một danh sách trong Python.',
  'singleSelect'
),
(
  'q8',
  'python_basics',
  'Loại dữ liệu nào trong Python không thay đổi được?',
  '["List", "Dictionary", "Tuple", "Set"]',
  '[2]',
  'Tuple là loại dữ liệu không thay đổi được (immutable) trong Python.',
  'singleSelect'
),
(
  'q9',
  'python_basics',
  'Từ khóa nào được sử dụng để lặp qua các phần tử trong một danh sách?',
  '["while", "for", "foreach", "loop"]',
  '[1]',
  'Từ khóa "for" được sử dụng để lặp qua các phần tử trong một danh sách.',
  'singleSelect'
),
(
  'q10',
  'python_basics',
  'Hàm nào được sử dụng để chuyển đổi một chuỗi thành một số?',
  '["str()", "int()", "float()", "num()"]',
  '[1, 2]',
  'Cả int() và float() được sử dụng để chuyển đổi một chuỗi thành một số.',
  'multiSelect'
);
```

## Data Types Explanation

### JSONB Type (for options and answers)

- **Options:** Stored as JSONB array
  ```json
  ["option1", "option2", "option3", "option4"]
  ```

- **Answer:** Stored as JSONB array of indices
  ```json
  [0]           // Single select: index 0
  [1, 3]        // Multi select: indices 1 and 3
  ```

### Why JSONB instead of separate tables?

- **Simpler data model** - Don't need junction tables for options
- **Better performance** - Single query returns complete question data
- **Flexibility** - Easy to store complex answer logic
- **PostgreSQL native** - JSONB has excellent performance and querying capabilities

---

## Querying the Database

### Get all quizzes

```sql
SELECT id, title, description, question_count, difficulty 
FROM quizzes;
```

### Get quiz with all questions

```sql
SELECT q.id, q.title, q.description, q.question_count, 
       (
         SELECT json_agg(
           json_build_object(
             'id', qst.id,
             'question', qst.question,
             'options', qst.options,
             'answer', qst.answer,
             'explanation', qst.explanation,
             'type', qst.type
           )
         )
         FROM questions qst WHERE qst.quiz_id = q.id
       ) as questions
FROM quizzes q
WHERE q.id = 'python_basics';
```

### Get questions for a quiz

```sql
SELECT id, question, options, answer, explanation, type 
FROM questions 
WHERE quiz_id = 'python_basics'
ORDER BY created_at;
```

---

## Migration Strategy

### Option 1: Using SQL Migration Files

Create a file `scripts/001_create_schema.sql`:

```bash
# Run migration
psql -h localhost -U postgres -d quizmate < scripts/001_create_schema.sql
```

### Option 2: Using Node Migration Script

Create `scripts/migrate.js`:

```javascript
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function migrate() {
  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS quizzes (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      question_count INT DEFAULT 0,
      difficulty VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  // ... rest of migrations
  console.log('Migration completed');
}
```

---

## Environment Variables for PostgreSQL

Add to `.env.local`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/quizmate
DATABASE_POOL_SIZE=20
```

---

## Performance Optimization

### Current Indexes

```sql
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_sessions_created ON user_sessions(created_at DESC);
```

### Recommended Additional Indexes (as you scale)

```sql
-- For user analytics
CREATE INDEX idx_sessions_quiz_id_completed ON user_sessions(quiz_id, completed_at);

-- For quiz difficulty filtering
CREATE INDEX idx_quizzes_difficulty ON quizzes(difficulty);
```

---

## Backup and Recovery

### Backup PostgreSQL

```bash
pg_dump -h localhost -U postgres quizmate > backup.sql
```

### Restore PostgreSQL

```bash
psql -h localhost -U postgres quizmate < backup.sql
```
