# QuizMate - Hướng Dẫn Triển Khai Local

## 1. YÊU CẦU HỆ THỐNG

### Cài đặt trước
- **Node.js**: v18 hoặc cao hơn ([tải từ nodejs.org](https://nodejs.org))
- **npm**: v9 hoặc cao hơn (đi kèm với Node.js)
- **Git**: Để clone repo ([tải từ git-scm.com](https://git-scm.com))
- **PostgreSQL**: v14+ (hoặc dùng Neon cloud database)

**Kiểm tra cài đặt:**
```bash
node --version    # phải >= v18
npm --version     # phải >= v9
git --version
```

---

## 2. TẢI VÀ SETUP PROJECT

### Bước 1: Clone hoặc Download Code
```bash
# Nếu dùng GitHub
git clone https://github.com/your-username/quizmate.git
cd quizmate

# Hoặc download ZIP từ v0 và giải nén
```

### Bước 2: Cài Dependencies
```bash
npm install
```

Lệnh này sẽ cài tất cả packages từ `package.json`:
- Next.js 16
- React 19
- Tailwind CSS
- Jest (testing)
- Form validation libraries
- UI components (Radix UI, shadcn)

---

## 3. CẤU HÌNH DATABASE

### Option A: Dùng Mock Data (Phát triển nhanh)
**Hiện tại dự án dùng Mock Data (file `lib/db.ts`)** - Không cần database!

```bash
npm run dev
# Vào http://localhost:3000 ngay lập tức
```

### Option B: Kết Nối PostgreSQL (Neon Cloud)

#### Bước 1: Tạo Account Neon
1. Vào [neon.tech](https://neon.tech)
2. Đăng ký tài khoản
3. Tạo project mới
4. Copy connection string

#### Bước 2: Cấu Hình .env.local
```bash
# Tạo file .env.local
cp .env.example .env.local
```

**Nội dung `.env.local`:**
```
# Neon PostgreSQL Connection
DATABASE_URL="postgresql://user:password@host:5432/quizmate"

# Auth (dùng bất cứ string nào)
JWT_SECRET="your-secret-key-here-min-32-chars"
ADMIN_PASSWORD="admin123"
```

#### Bước 3: Setup Database Schema
```bash
# Chạy SQL script để tạo bảng
psql $DATABASE_URL -f scripts/setup-postgres.sql
```

**Hoặc nếu dùng Neon SQL Editor:**
1. Vào Neon Console
2. Copy toàn bộ SQL từ `POSTGRES_SCHEMA.md`
3. Paste vào SQL Editor
4. Run

#### Bước 4: Seed Data (tùy chọn)
```bash
# Nếu tạo script seed
psql $DATABASE_URL -f scripts/seed-data.sql
```

---

## 4. CHẠY PROJECT LOCAL

```bash
npm run dev
```

Output:
```
> next dev
  ▲ Next.js 16.0.0
  - Local:        http://localhost:3000
  - Environment:  .env.local
```

**Truy cập:**
- Homepage: http://localhost:3000
- Admin: http://localhost:3000/admin/login
- API: http://localhost:3000/api/health

---

## 5. TEST CÁC FEATURES

### A. Test Quiz Taking Flow
1. Vào http://localhost:3000
2. Chọn một quiz
3. Trả lời các câu hỏi
4. Submit
5. Xem kết quả (score %)
6. Review câu trả lời + giải thích

### B. Test Admin Features
1. Vào http://localhost:3000/admin/login
2. Nhập: `admin123`
3. Xem danh sách quiz
4. Thêm/edit câu hỏi
5. Xem chi tiết quiz

### C. Test API Endpoints
```bash
# Terminal mới - test API
curl http://localhost:3000/api/health
# Response: {"status":"ok"}

curl http://localhost:3000/api/v1/quizzes
# Response: Danh sách quiz

curl http://localhost:3000/api/v1/quizzes/python_keywords_expert
# Response: Quiz + questions
```

---

## 6. PHÁT TRIỂN TIẾP

### Cấu Trúc Thư Mục
```
project/
├── app/
│   ├── page.tsx              # Homepage
│   ├── quiz/[id]/page.tsx    # Quiz page
│   ├── quiz/[id]/result/     # Result page
│   ├── quiz/[id]/review/     # Review page
│   ├── admin/                # Admin pages
│   └── api/v1/               # API routes
├── components/               # React components
├── lib/
│   ├── db.ts                 # Database (mock hoặc Postgres)
│   ├── quiz-service.ts       # API client
│   └── auth.ts               # Authentication
├── __tests__/                # Jest tests
└── package.json
```

### Chỉnh Sửa Code
```bash
# Code mới tự động reload nhờ hot reload của Next.js
# Edit file → Save → Browser auto refresh
```

### Thêm Câu Hỏi Mới
**Sửa trong `lib/db.ts` (mock data):**
```typescript
const questions: Question[] = [
  // ...existing questions
  {
    id: "q11",
    quizId: "python_basics",
    question: "Câu hỏi mới của bạn?",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
    answer: [0], // Index đáp án đúng
    type: "singleSelect",
    explanation: "Giải thích chi tiết",
  },
]
```

### Thêm Quiz Mới
**Sửa trong `lib/db.ts`:**
```typescript
const quizzes: Quiz[] = [
  // ...existing quizzes
  {
    id: "new_quiz_id",
    title: "Quiz Title",
    description: "Quiz Description",
    questionCount: 5,
    difficulty: "Beginner",
  },
]
```

---

## 7. CHẠY TESTS

```bash
# Chạy tất cả tests
npm test

# Chạy tests (watch mode - auto-reload khi thay đổi)
npm run test:watch

# Xem code coverage
npm run test:coverage
```

---

## 8. BUILD FOR PRODUCTION

```bash
# Build (kiểm tra lỗi)
npm run build

# Run production build (local)
npm start
```

---

## 9. TROUBLESHOOTING

### Lỗi "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Port 3000 đã được dùng
```bash
npm run dev -- -p 3001
# Hoặc dùng port khác
```

### Env variables không hoạt động
1. Kiểm tra file `.env.local` có tồn tại không
2. Khởi động lại dev server (`Ctrl+C` rồi `npm run dev`)
3. Check values trong `.env.local`

### Database connection failed
```bash
# Test connection string
psql $DATABASE_URL -c "SELECT 1"
# Nếu lỗi → copy lại connection string từ Neon
```

---

## 10. GIT & VERSION CONTROL

```bash
# Khởi tạo git repo (nếu chưa có)
git init

# Add files
git add .

# Commit
git commit -m "Initial commit: QuizMate project"

# Liên kết GitHub repo (thay URL)
git remote add origin https://github.com/your-username/quizmate.git
git branch -M main
git push -u origin main
```

---

## 11. DEPLOY KỀ VERCEL (Production)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Hoặc:** Push lên GitHub → Vercel tự động deploy

---

## TÓMLƯỢC LỆNH CỰC NHANH

```bash
# Setup
npm install

# Chạy dev
npm run dev

# Test
npm test

# Build
npm run build

# Production
npm start
```

**Hết! Bạn đã sẵn sàng phát triển QuizMate! 🚀**
