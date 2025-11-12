-- Create database and user
CREATE DATABASE quizmate;
CREATE USER quizmate_user WITH PASSWORD 'quizmate_pass_123';

-- Connect to database
\c quizmate

-- Set privileges
ALTER ROLE quizmate_user SET client_encoding TO 'utf8';
ALTER ROLE quizmate_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE quizmate_user SET default_transaction_deferrable TO on;
ALTER ROLE quizmate_user SET default_transaction_read_only TO off;

GRANT ALL PRIVILEGES ON DATABASE quizmate TO quizmate_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO quizmate_user;

-- Create tables
CREATE TABLE quizzes (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  question_count INTEGER NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
  id VARCHAR(255) PRIMARY KEY,
  quiz_id VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  answer JSONB NOT NULL,
  explanation TEXT,
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE user_sessions (
  id VARCHAR(255) PRIMARY KEY,
  quiz_id VARCHAR(255) NOT NULL,
  answers JSONB NOT NULL,
  score_percent INTEGER,
  correct_count INTEGER,
  total_count INTEGER,
  status VARCHAR(50) DEFAULT 'in_progress',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  user_id VARCHAR(255),
  details JSONB,
  status VARCHAR(50),
  ip_address VARCHAR(255),
  request_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_user_sessions_quiz_id ON user_sessions(quiz_id);
CREATE INDEX idx_user_sessions_status ON user_sessions(status);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Grant privileges to user
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO quizmate_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO quizmate_user;
