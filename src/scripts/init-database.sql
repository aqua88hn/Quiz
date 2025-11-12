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
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO quizmate_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO quizmate_user;