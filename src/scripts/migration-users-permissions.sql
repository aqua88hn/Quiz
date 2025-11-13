-- New migration for quizzes, questions, user_sessions, audit_logs, users and permissions tables


-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator')),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  permission_name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role, permission_id)
);

-- Create audit_logs table for tracking user actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(255),
  resource_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tables
CREATE TABLE IF NOT EXISTS quizzes (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  question_count INTEGER NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
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

CREATE TABLE IF NOT EXISTS user_sessions (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  quiz_id VARCHAR(255) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score_percent INTEGER,
  correct_count INTEGER,
  total_count INTEGER,
  status VARCHAR(50) NOT NULL DEFAULT 'in_progress',
  client_ip VARCHAR(45),
  user_agent TEXT,
  created_at timestamptz NOT NULL DEFAULT timezone('UTC', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('UTC', now()),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.db_error_logs (
  id bigserial PRIMARY KEY,
  sql_text text NOT NULL,
  params jsonb,
  error_code text,
  error_message text,
  error_detail text,
  created_at timestamptz NOT NULL DEFAULT timezone('UTC', now())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_quiz_id ON user_sessions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON user_sessions(status);


-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Indexes for sessions (lọc theo user/quiz/time)
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_quiz_id ON user_sessions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON user_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_quiz_created
  ON user_sessions(user_id, quiz_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_brin
  ON user_sessions USING BRIN (created_at);

-- Indexes for db_error_logs
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Time-range scans on large append-only log table
CREATE INDEX IF NOT EXISTS idx_db_error_logs_created_at_brin
  ON db_error_logs USING BRIN (created_at);

-- Filter by code and order by time
CREATE INDEX IF NOT EXISTS idx_db_error_logs_error_code_created_at
  ON db_error_logs (error_code, created_at DESC);

-- Optional: substring search in SQL/error text
CREATE INDEX IF NOT EXISTS idx_db_error_logs_sql_text_trgm
  ON db_error_logs USING GIN (sql_text gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_db_error_logs_error_message_trgm
  ON db_error_logs USING GIN (error_message gin_trgm_ops);