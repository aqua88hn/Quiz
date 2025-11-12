import { type NextRequest, NextResponse } from "next/server"
import { getQuizzes } from "@/lib/db"
import { asyncWrapper } from "@/lib/middleware/asyncWrapper"
import type { RequestContext } from "@/lib/middleware/types"
async function GET(request: NextRequest, ctx: RequestContext) {
  const quizzes = getQuizzes()
  return NextResponse.json({
    success: true,
    requestId: ctx.requestId,
    data: quizzes,
  })
}

export default asyncWrapper(GET)
