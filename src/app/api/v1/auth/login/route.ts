import { type NextRequest, NextResponse } from "next/server"
import { generateToken, validateAdminPassword } from "@/lib/auth"
import { asyncWrapper } from "@/lib/middleware/asyncWrapper"
import type { RequestContext } from "@/lib/middleware/types"
import { ValidationError, AuthError } from "@/lib/middleware/types"
import { logAuditAction } from "@/lib/middleware/requestLogger"

async function POST(request: NextRequest, ctx: RequestContext) {
  const body = await request.json()
  const { password } = body

  if (!password) {
    throw new ValidationError("Password required", { field: "password" })
  }

  if (!validateAdminPassword(password)) {
    logAuditAction(ctx.requestId, "unknown", "CREATE", "auth_session", "login", "FAILED")
    throw new AuthError("Invalid password")
  }

  const token = generateToken("admin")

  logAuditAction(ctx.requestId, "admin", "CREATE", "auth_session", "login", "SUCCESS")

  return NextResponse.json({
    success: true,
    requestId: ctx.requestId,
    data: { token },
  })
}

export default asyncWrapper(POST)
