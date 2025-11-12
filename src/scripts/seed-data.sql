
-- Insert default permissions
INSERT INTO permissions (permission_name, description) VALUES
  ('view_quizzes', 'View quiz list'),
  ('take_quiz', 'Take quiz'),
  ('view_results', 'View quiz results'),
  ('manage_quizzes', 'Create, edit, delete quizzes'),
  ('manage_questions', 'Manage quiz questions'),
  ('manage_users', 'Manage users and permissions'),
  ('view_analytics', 'View analytics and metrics'),
  ('manage_audit_logs', 'View and manage audit logs')
ON CONFLICT DO NOTHING;

-- Insert role permissions
INSERT INTO role_permissions (role, permission_id) 
SELECT 'admin', id FROM permissions ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id) 
SELECT 'user', id FROM permissions WHERE permission_name IN ('view_quizzes', 'take_quiz', 'view_results')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id) 
SELECT 'moderator', id FROM permissions WHERE permission_name IN ('view_quizzes', 'take_quiz', 'view_results', 'manage_quizzes', 'manage_questions')
ON CONFLICT DO NOTHING;

-- Seed default admin user (password: admin123 hashed)

-- Password: admin123
-- Hash generated with bcrypt, cost 10
INSERT INTO users (username, email, password_hash, role, status) 
VALUES 
  ('admin', 'admin@quizmate.local', '$2b$10$d9ZH2lnVZb/jtLNIB/dO0.ue7TP4nYNXBOO3F5LOu8rLr9KNH3IIa', 'admin', 'active'),
  ('demo_user', 'demo@quizmate.local', '$2b$10$d9ZH2lnVZb/jtLNIB/dO0.ue7TP4nYNXBOO3F5LOu8rLr9KNH3IIa', 'user', 'active')
ON CONFLICT DO NOTHING;

-- Insert Quizzes
INSERT INTO quizzes (id, title, description, question_count, difficulty) VALUES
('python_keywords_expert', 'Python Keywords Expert', 'Advanced questions on Python reserved keywords', 5, 'Expert'),
('python_basics', 'Python Basics', 'Fundamental concepts of Python programming', 5, 'Beginner');
-- Insert Questions for python_keywords_expert
INSERT INTO questions (id, quiz_id, question, options, answer, explanation, type) VALUES
(
  'q1',
  'python_keywords_expert',
  'Từ khóa nào dùng để định nghĩa một hàm trong Python?',
  '["function", "def", "lambda", "define"]'::jsonb,
  '[1]'::jsonb,
  'Từ khóa "def" được sử dụng để định nghĩa một hàm trong Python.',
  'singleSelect'
),
(
  'q2',
  'python_keywords_expert',
  'Từ khóa nào dùng để tạo một hàm bất động bộ?',
  '["async", "await", "def", "thread"]'::jsonb,
  '[0]'::jsonb,
  'Từ khóa "async" được sử dụng để định nghĩa một hàm bất động bộ trong Python.',
  'singleSelect'
),
(
  'q3',
  'python_keywords_expert',
  'Từ khóa "yield" thường được dùng trong loại hàm nào?',
  '["Hàm bình thường", "Generator", "Hàm lambda", "Async function"]'::jsonb,
  '[1]'::jsonb,
  '"yield" được sử dụng trong các hàm generator để trả về các giá trị một lần một.',
  'singleSelect'
),
(
  'q4',
  'python_keywords_expert',
  'Cách nào để tạo một hàm với số lượng đối số không xác định?',
  '["*args", "**kwargs", "Cả hai *args và **kwargs", "Không thể làm được"]'::jsonb,
  '[0, 1]'::jsonb,
  'Cả *args và **kwargs đều có thể được sử dụng để tạo hàm với số lượng đối số không xác định.',
  'multiSelect'
),
(
  'q5',
  'python_keywords_expert',
  'Từ khóa nào dùng để xử lý ngoại lệ trong Python?',
  '["try-catch", "try-except", "error-handle", "handle-error"]'::jsonb,
  '[1]'::jsonb,
  'Từ khóa "try-except" được sử dụng để xử lý ngoại lệ trong Python.',
  'singleSelect'
);

-- Insert Questions for python_basics
INSERT INTO questions (id, quiz_id, question, options, answer, explanation, type) VALUES
(
  'q6',
  'python_basics',
  'Cách nào để tạo một danh sách trong Python?',
  '["{}", "[]", "()", "list()"]'::jsonb,
  '[1, 3]'::jsonb,
  'Cả [] và list() đều có thể được sử dụng để tạo một danh sách trong Python.',
  'multiSelect'
),
(
  'q7',
  'python_basics',
  'Hàm nào được sử dụng để lấy độ dài của một danh sách?',
  '["size()", "length()", "len()", "count()"]'::jsonb,
  '[2]'::jsonb,
  'Hàm len() được sử dụng để lấy độ dài của một danh sách trong Python.',
  'singleSelect'
),
(
  'q8',
  'python_basics',
  'Loại dữ liệu nào trong Python không thay đổi được?',
  '["List", "Dictionary", "Tuple", "Set"]'::jsonb,
  '[2]'::jsonb,
  'Tuple là loại dữ liệu không thay đổi được (immutable) trong Python.',
  'singleSelect'
),
(
  'q9',
  'python_basics',
  'Từ khóa nào được sử dụng để lặp qua các phần tử trong một danh sách?',
  '["while", "for", "foreach", "loop"]'::jsonb,
  '[1]'::jsonb,
  'Từ khóa "for" được sử dụng để lặp qua các phần tử trong một danh sách.',
  'singleSelect'
),
(
  'q10',
  'python_basics',
  'Hàm nào được sử dụng để chuyển đổi một chuỗi thành một số?',
  '["str()", "int()", "float()", "num()"]'::jsonb,
  '[1, 2]'::jsonb,
  'Cả int() và float() được sử dụng để chuyển đổi một chuỗi thành một số.',
  'multiSelect'
);