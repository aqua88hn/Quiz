import { type NextRequest, NextResponse } from "next/server"
import { submitAnswers, type Answer } from "@/lib/db"
import { asyncWrapper } from "@/lib/middleware/asyncWrapper"
import type { RequestContext } from "@/lib/middleware/types"
import { ValidationError } from "@/lib/middleware/types"
import { metricsCollector } from "@/lib/metrics"
import { logAuditAction } from "@/lib/middleware/requestLogger"

async function POST(request: NextRequest, ctx: RequestContext & { params: { id: string } }) {
  const { id } = ctx.params
  const body = await request.json()
  const { answers } = body

  if (!Array.isArray(answers)) {
    throw new ValidationError("Invalid answers format", { field: "answers" })
  }

  const result = submitAnswers(id, answers as Answer[])

  // Record metrics
  metricsCollector.recordRequest(`/api/v1/quizzes/${id}/submit`, 0, false)

  // Log audit if user info available
  if (ctx.userId) {
    logAuditAction(ctx.requestId, ctx.userId, "CREATE", "submission", id, "SUCCESS")
  }

  return NextResponse.json({
    success: true,
    requestId: ctx.requestId,
    data: result,
  })
}

export default asyncWrapper(POST as any)
