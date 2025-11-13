import { NextResponse, type NextRequest } from "next/server"
import { asyncWrapper } from "@/lib/middleware/asyncWrapper"
import { updateQuestion, deleteQuestion } from "@/lib/db-quiz-question"

function extractIds(pathname: string) {
  const m = pathname.match(/\/quizzes\/([^/]+)\/questions\/([^/]+)$/i)
  return { quizId: m?.[1], questionId: m?.[2] }
}

export const PUT = asyncWrapper(async (req: NextRequest) => {
  const { quizId, questionId } = extractIds(req.nextUrl.pathname)
  if (!quizId || !questionId) return NextResponse.json({ success: false, error: "Missing ids" }, { status: 400 })
  const body = await req.json().catch(() => ({}))
  const updated = await updateQuestion(quizId, questionId, body)
  if (!updated) return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 })
  return NextResponse.json({ success: true, data: updated })
})

export const DELETE = asyncWrapper(async (req: NextRequest) => {
  const { quizId, questionId } = extractIds(req.nextUrl.pathname)
  if (!quizId || !questionId) return NextResponse.json({ success: false, error: "Missing ids" }, { status: 400 })
  const res = await deleteQuestion(quizId, questionId)
  if (!res.deleted) return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 })
  return NextResponse.json({ success: true, data: { deleted: true } })
})