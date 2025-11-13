import { NextResponse, type NextRequest } from "next/server"
import { asyncWrapper } from "@/lib/middleware/asyncWrapper"
import { createQuestionForQuiz } from "@/lib/db-quiz-question"

function extractQuizId(pathname: string) {
  const m = pathname.match(/\/quizzes\/([^/]+)\/questions$/i)
  return m?.[1]
}

export const POST = asyncWrapper(async (req: NextRequest) => {
  const id = extractQuizId(req.nextUrl.pathname)
  if (!id) return NextResponse.json({ success: false, error: "Missing quiz id" }, { status: 400 })

  const body = await req.json().catch(() => null)
  if (!body?.question || !Array.isArray(body?.options) || !Array.isArray(body?.answer)) {
    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 })
  }

  try {
    const created = await createQuestionForQuiz(id, body)
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (err: any) {
    console.error("[API] create question error:", { code: err?.code, message: err?.message, detail: err?.detail })
    const msg = err?.detail || err?.message || "Internal Server Error"
    return NextResponse.json({ success: false, error: msg, code: err?.code }, { status: 500 })
  }
})