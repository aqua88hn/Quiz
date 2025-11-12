import { type NextRequest, NextResponse } from "next/server"
import { getQuizById, getQuestionsByQuizId } from "@/lib/db"
import { asyncWrapper } from "@/lib/middleware/asyncWrapper"
import type { RequestContext } from "@/lib/middleware/types"
import { NotFoundError } from "@/lib/middleware/types"

async function GET(request: NextRequest, ctx: RequestContext & { params: { id: string } }) {
  const { id } = ctx.params
  const quiz = getQuizById(id)

  if (!quiz) {
    throw new NotFoundError("Quiz not found")
  }

  const questions = getQuestionsByQuizId(id)

  return NextResponse.json({
    success: true,
    requestId: ctx.requestId,
    data: {
      ...quiz,
      questions,
    },
  })
}

export default asyncWrapper(GET as any)
