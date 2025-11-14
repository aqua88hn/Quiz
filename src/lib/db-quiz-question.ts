import { error } from "console";
import { getPool } from "@/lib/db-connection"
import { randomUUID } from "crypto"
import { logger } from '@/lib/middleware/logger'

function dbDebug(sql: string, params?: any[]) {
  console.debug("[DB DEBUG] Query:", sql.trim().replace(/\s+/g, " "))
  if (params?.length) console.debug("[DB DEBUG] Values:", params)
  
  
  logger.debug('Test logger.debug : ', { params });
}

const UTC_NOW = "timezone('UTC', now())"

function normalizeOptions(v: any): string[] {
  if (Array.isArray(v)) return v.map(String)
  if (v == null) return []
  if (typeof v === "string") {
    try {
      const p = JSON.parse(v)
      return Array.isArray(p) ? p.map(String) : []
    } catch {
      return []
    }
  }
  return []
}

function normalizeAnswer(v: any): number[] {
  if (Array.isArray(v)) return v.map((n) => Number(n))
  if (v == null) return []
  if (typeof v === "string") {
    try {
      const p = JSON.parse(v)
      return Array.isArray(p) ? p.map((n) => Number(n)) : []
    } catch {
      return []
    }
  }
  return []
}

async function logDbError(sql: string, params: any[] | undefined, err: any) {
  try {
    const pool = getPool()
    await pool.query(
      `INSERT INTO public.db_error_logs(sql_text, params, error_code, error_message, error_detail, created_at)
       VALUES ($1, $2, $3, $4, $5, ${UTC_NOW})`,
      [
        sql.trim(),
        params ? JSON.stringify(params) : null,
        err?.code ?? null,
        err?.message ?? null,
        err?.detail ?? null,
      ],
    )
  } catch {
    // ignore
  }
}

async function formatLocalTime(date: string | Date | null | undefined): Promise<string | undefined> {
  if (!date) return undefined;
  return new Date(date).toLocaleString();
}

const QUESTION_ID_PREFIX = process.env.QUIZ_QUESTION_ID_PREFIX || "q"
function generatePrefixedId(prefix = QUESTION_ID_PREFIX): string {
  // Prefer Web Crypto if available
  const uuid =
    (globalThis as any)?.crypto?.randomUUID?.()
      ?.toString()
      ?.replace(/-/g, "")
  if (uuid) return `${prefix}_${uuid}`
  // Fallback: timestamp + random
  const d = new Date()
  const ts = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(
    d.getUTCDate(),
  ).padStart(2, "0")}${String(d.getUTCHours()).padStart(2, "0")}${String(d.getUTCMinutes()).padStart(
    2,
    "0",
  )}${String(d.getUTCSeconds()).padStart(2, "0")}${String(d.getUTCMilliseconds()).padStart(3, "0")}`
  const rand = Math.random().toString(36).slice(2, 10)
  return `${prefix}_${ts}_${rand}`
}
// UTC helper
const SQL_GET_QUIZZES = `
SELECT q.id, q.title, q.description, q.created_at, COUNT(qq.id) AS question_count, q.difficulty
FROM quizzes q
LEFT JOIN questions qq ON qq.quiz_id = q.id
GROUP BY q.id
ORDER BY q.created_at DESC
`;

// get quizzes
export async function getQuizzes() {
  const pool = getPool();
  dbDebug(SQL_GET_QUIZZES);
  const res = await pool.query(SQL_GET_QUIZZES);
  return res.rows.map((r: any) => ({
    id: String(r.id),
    title: r.title,
    description: r.description ?? "",
    question_count: Number(r.question_count ?? 0),
    difficulty: r.difficulty || "Beginner",
    created_at: r.created_at ?? null,
    updated_at: r.updated_at ?? null,
  }));
}

// create new quiz
export async function createQuiz(payload: {
  id?: string
  title: string
  description?: string | null
  question_count?: number
  difficulty?: string
}) {
  const pool = getPool();
  const id = (payload.id || payload.title)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");

  const questionCount = Number.isFinite(payload.question_count) ? Number(payload.question_count) : 0
  const difficulty = payload.difficulty || "Beginner"

  // Try with created_at; if column doesn't exist (42703) fallback to 3-column insert.
  const SQL_WITH_CREATED = `
    INSERT INTO quizzes (id, title, description, question_count, difficulty, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, ${UTC_NOW}, ${UTC_NOW})
    RETURNING id, title, description, question_count, difficulty, created_at, updated_at`; 

  const params = [id, payload.title, payload.description ?? null, questionCount, difficulty];
  try {
    dbDebug(SQL_WITH_CREATED, params);
    const r = await pool.query(SQL_WITH_CREATED, params);
    return r.rows[0];
  } catch (err: any) {
    await logDbError(SQL_WITH_CREATED, params, err)
  }
}

// get quiz by id
export async function getQuizById(id: string) {
  const pool = getPool();
  const SQL = `SELECT id, title, description, created_at FROM quizzes WHERE id = $1`;
  dbDebug(SQL, [id]);
  const r = await pool.query(SQL, [id]);
  return r.rows[0] ? { ...r.rows[0], id: String(r.rows[0].id) } : null;
}

// get question by quizId
export async function getQuestionsByQuizId(quizId: string) {
  const pool = getPool()
  const SQL = `SELECT id, quiz_id, question, options, answer, explanation, type, created_at, updated_at
               FROM questions WHERE quiz_id = $1 ORDER BY id`
  dbDebug(SQL, [quizId])
  try {
    const res = await pool.query(SQL, [quizId])
    return res.rows.map((r: any) => ({
      id: String(r.id),
      quizId: String(r.quiz_id),
      question: r.question,
      options: normalizeOptions(r.options),
      answer: normalizeAnswer(r.answer),
      explanation: r.explanation ?? "",
      type: r.type === "multiSelect" ? "multiSelect" : "singleSelect",
      created_at: formatLocalTime(r.created_at),
      updated_at: formatLocalTime(r.updated_at),
    }))
  } catch (e: any) {
    await logDbError(SQL, [quizId], e)
    throw e
  }
}

export async function createQuestionForQuiz(
  quizId: string,
  body: { question: string; options: any[]; answer: number[]; explanation?: string; type?: string },
) {
  const pool = getPool()
  const newId = generatePrefixedId()

  // Try schema with Postgres arrays (text[]/int[]) 
  const SQL_ARRAY = `INSERT INTO questions (id, quiz_id, question, options, answer, explanation, type, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, ${UTC_NOW})
                     RETURNING id, quiz_id, question, options, answer, explanation, type, created_at`
  const P_ARRAY = [
    newId,
    quizId,
    body.question,
    (body.options || []).map(String),
    (body.answer || []).map((x) => Number(x)),
    body.explanation ?? null,
    body.type || "singleSelect",
  ]

  try {
    dbDebug(SQL_ARRAY, P_ARRAY)
    const res = await pool.query(SQL_ARRAY, P_ARRAY)
    const r = res.rows[0]
    return {
      id: String(r.id),
      quizId: String(r.quiz_id),
      question: r.question,
      options: normalizeOptions(r.options),
      answer: normalizeAnswer(r.answer),
      explanation: r.explanation ?? "",
      type: r.type === "multiSelect" ? "multiSelect" : "singleSelect",
      created_at: formatLocalTime(r.created_at),
    }
  } catch (e: any) {
    // log and fallback to JSONB if type mismatch/column jsonb
    await logDbError(SQL_ARRAY, P_ARRAY, e)
    // 42804: datatype mismatch, 42703: column missing, 22P02 (invalid_text_representation) -> fallback JSONB
    if (e?.code !== "42804" && e?.code !== "42703" && e?.code !== "22P02") throw e
  }

  // Fallback JSONB schema
  const SQL_JSONB = `INSERT INTO questions (id, quiz_id, question, options, answer, explanation, type, created_at)
                     VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, ${UTC_NOW})
                     RETURNING id, quiz_id, question, options, answer, explanation, type, created_at`
  const P_JSONB = [
    newId,
    quizId,
    body.question,
    JSON.stringify((body.options || []).map(String)),
    JSON.stringify((body.answer || []).map((x) => Number(x))),
    body.explanation ?? null,
    body.type || "singleSelect",
  ]
  try {
    dbDebug(SQL_JSONB, P_JSONB)
    const res = await pool.query(SQL_JSONB, P_JSONB)
    const r = res.rows[0]
    return {
      id: String(r.id),
      quizId: String(r.quiz_id),
      question: r.question,
      options: normalizeOptions(r.options),
      answer: normalizeAnswer(r.answer),
      explanation: r.explanation ?? "",
      type: r.type === "multiSelect" ? "multiSelect" : "singleSelect",
      created_at: formatLocalTime(r.created_at),
    }
  } catch (e2: any) {
    await logDbError(SQL_JSONB, P_JSONB, e2)
    throw e2
  }
}

export async function updateQuiz(
  id: string,
  updates: { 
    title?: string; 
    description?: string | null;
    question_count?: number | null;
    difficulty?: string | null
  }) {
  const pool = getPool();
  const SQL_WITH_UPDATED = `
    UPDATE quizzes
       SET title = COALESCE($2, title),
           description = COALESCE($3, description),
           question_count = COALESCE($4, question_count),
           difficulty = COALESCE($5, difficulty),
           updated_at = ${UTC_NOW}
     WHERE id = $1
     RETURNING id, title, description, question_count, difficulty, created_at, updated_at
  `;
  const SQL_NO_UPDATED = `
    UPDATE quizzes
       SET title = COALESCE($2, title),
           description = COALESCE($3, description),
           updated_at = ${UTC_NOW}
     WHERE id = $1
     RETURNING id, title, description, created_at
  `;
  const params = [
    id,
    updates.title ?? null,
    updates.description ?? null,
    updates.question_count ?? null,
    updates.difficulty ?? null,
  ]
  try {
    dbDebug(SQL_WITH_UPDATED, params);
    const res = await pool.query(SQL_WITH_UPDATED, params);
    const row = res.rows[0];
    return row
      ? {
          ...row,
          id: String(row.id),
          created_at: formatLocalTime(row.created_at),
          updated_at: formatLocalTime(row.updated_at),
        }
      : null;
  } catch (e: any) {
    if (e?.code !== "42804" && e?.code !== "42703" && e?.code !== "22P02" )  throw e;
  }

  dbDebug(SQL_NO_UPDATED, params);
  const res = await pool.query(SQL_NO_UPDATED, params);
  const row = res.rows[0];
  return row
    ? {
        ...row,
        id: String(row.id),
        created_at: formatLocalTime(row.created_at),
      }
    : null;
}

export async function deleteQuiz(id: string) {
  const pool = getPool();
  const SQL = `DELETE FROM quizzes WHERE id = $1 RETURNING id`;
  dbDebug(SQL, [id]);
  const res = await pool.query(SQL, [id]);
  const count = res.rowCount ?? 0;
  return { deleted: count > 0, count };
}

export async function updateQuestion(
  quizId: string,
  questionId: string,
  body: {
    question?: string;
    options?: any[];
    answer?: number[];
    explanation?: string | null;
    type?: string;
  }
) {
  const pool = getPool()
  // 1) ARRAY try
  const SQL_ARRAY = `
    UPDATE questions
       SET question = COALESCE($3, question),
           options = COALESCE($4, options),
           answer = COALESCE($5, answer),
           explanation = COALESCE($6, explanation),
           type = COALESCE($7, type),
           updated_at = ${UTC_NOW}
     WHERE id = $1 AND quiz_id = $2
     RETURNING id, quiz_id, question, options, answer, explanation, type, updated_at`
  const P_ARRAY = [
    questionId,
    quizId,
    body.question ?? null,
    body.options ?? null,
    body.answer ?? null,
    body.explanation ?? null,
    body.type ?? null,
  ]
  try {
    dbDebug(SQL_ARRAY, P_ARRAY)
    const res = await pool.query(SQL_ARRAY, P_ARRAY)
    const r = res.rows[0]
    if (r) {
      return {
        id: String(r.id),
        quizId: String(r.quiz_id),
        question: r.question,
        options: normalizeOptions(r.options),
        answer: normalizeAnswer(r.answer),
        explanation: r.explanation ?? "",
        type: r.type === "multiSelect" ? "multiSelect" : "singleSelect",
        updated_at: formatLocalTime(r.updated_at),
      }
    }
  } catch (e: any) {
    await logDbError(SQL_ARRAY, P_ARRAY, e)

    // 42804: datatype mismatch, 42703: column missing, 22P02 (invalid_text_representation) -> fallback JSONB
    if (e?.code !== "42804" && e?.code !== "42703" && e?.code !== "22P02") throw e
  }

  // 2) Fallback JSONB
  const SQL_JSONB = `
    UPDATE questions
       SET question = COALESCE($3, question),
           options = COALESCE($4::jsonb, options),
           answer = COALESCE($5::jsonb, answer),
           explanation = COALESCE($6, explanation),
           type = COALESCE($7, type),
           updated_at = ${UTC_NOW}
     WHERE id = $1 AND quiz_id = $2
     RETURNING id, quiz_id, question, options, answer, explanation, type, updated_at`
  const P_JSONB = [
    questionId,
    quizId,
    body.question ?? null,
    body.options ? JSON.stringify(body.options) : null,
    body.answer ? JSON.stringify(body.answer) : null,
    body.explanation ?? null,
    body.type ?? null,
  ]
  dbDebug(SQL_JSONB, P_JSONB)
  const res = await pool.query(SQL_JSONB, P_JSONB)
  const r = res.rows[0]
  if (!r) return null
  return {
    id: String(r.id),
    quizId: String(r.quiz_id),
    question: r.question,
    options: normalizeOptions(r.options),
    answer: normalizeAnswer(r.answer),
    explanation: r.explanation ?? "",
    type: r.type === "multiSelect" ? "multiSelect" : "singleSelect",
    updated_at: formatLocalTime(r.updated_at),
  }
}

export async function deleteQuestion(quizId: string, questionId: string) {
  const pool = getPool();
  const SQL = `DELETE FROM questions WHERE id = $1 AND quiz_id = $2 RETURNING id`;
  const params = [questionId, quizId];
  dbDebug(SQL, params);
  const res = await pool.query(SQL, params);
  const count = res.rowCount ?? 0;
  return { deleted: count > 0, count };
}

export async function saveCompletedUserSession(input: {
  quizId: string
  userId?: number | null
  answers: any
  scorePercent: number
  correctCount: number
  totalCount: number
  clientIp?: string | null
  userAgent?: string | null
}) {
  const pool = getPool()
  const id = (globalThis as any)?.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  const SQL = `
    INSERT INTO user_sessions
      (id, quiz_id, user_id, answers, score_percent, correct_count, total_count, status,
       client_ip, user_agent, created_at, updated_at, completed_at)
    VALUES
      ($1, $2, $3, $4::jsonb, $5, $6, $7, 'completed',
       $8, $9, ${UTC_NOW}, ${UTC_NOW}, ${UTC_NOW})
    RETURNING id, quiz_id, user_id, score_percent, correct_count, total_count, status, created_at, completed_at
  `
  const params = [
    id,
    input.quizId,
    input.userId ?? null,
    JSON.stringify(input.answers ?? []),
    input.scorePercent,
    input.correctCount,
    input.totalCount,
    input.clientIp ?? null,
    input.userAgent ?? null,
  ]
  const res = await pool.query(SQL, params)
  return res.rows[0]
}

export async function getUserSessionsByUser(userId: number, opts?: { limit?: number; offset?: number }) {
  const pool = getPool()
  const limit = Math.max(1, Math.min(200, opts?.limit ?? 50))
  const offset = Math.max(0, opts?.offset ?? 0)
  const SQL = `
    SELECT id, quiz_id, score_percent, correct_count, total_count, status, created_at, completed_at
    FROM user_sessions
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `
  const res = await pool.query(SQL, [userId, limit, offset])
  return res.rows.map((r: any) => ({
    ...r,
    created_at: formatLocalTime(r.created_at),
    completed_at: formatLocalTime(r.completed_at),
  }))
}
