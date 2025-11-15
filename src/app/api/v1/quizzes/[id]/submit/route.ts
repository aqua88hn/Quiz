import { NextResponse, type NextRequest } from "next/server"
import { asyncWrapper } from "@/lib/middleware/asyncWrapper" 
import { saveCompletedUserSession } from "@/lib/datalayer/db-quiz-question"
import { getClientIp } from "@/lib/middleware/logger"

function extractQuizId(pathname: string) {
  const m = pathname.match(/\/quizzes\/([^/]+)\/submit$/i)
  return m?.[1]
}

// Temporary local implementation to avoid missing export; replace with real DB-backed grading as needed.
async function submitAnswers(quizId: string, answers: any[]) {
  const total = Array.isArray(answers) ? answers.length : 0
  const correctCount = 0
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const details = (answers ?? []).map((a: any) => ({
    questionId: a?.questionId ?? null,
    isCorrect: false,
    correctIndex: null,
    chosenIndex: a?.answerIndex ?? null,
  }))
  return { scorePercent, correctCount, total, details }
}

export const POST = asyncWrapper(async (request: NextRequest) => {
  const quizId = extractQuizId(request.nextUrl.pathname)
  if (!quizId) return NextResponse.json({ success: false, error: "Missing quiz id" }, { status: 400 })

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }
  const answers = Array.isArray(body?.answers) ? body.answers : null
  if (!answers) return NextResponse.json({ success: false, error: "Invalid payload: answers[]" }, { status: 400 })

  // expect { scorePercent, correctCount, total, details }
  const result = await submitAnswers(quizId, answers)
  
  // 2) Save by user section
  await saveCompletedUserSession({
    quizId,
    userId: null, // nếu có auth thì truyền userId thật
    answers,
    scorePercent: result.scorePercent,
    correctCount: result.correctCount,
    totalCount: result.total,
    clientIp: getClientIp(request),
    userAgent: request.headers.get("user-agent"),
  })

  return NextResponse.json({ success: true, data: result })
})
