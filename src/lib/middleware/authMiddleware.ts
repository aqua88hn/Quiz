import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"
import { AuthError, type RequestContext } from "./types"

export function attachAuthContext(request: NextRequest, ctx: RequestContext): void {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) {
    return
  }

  try {
    const token = authHeader.replace("Bearer ", "")
    const payload = verifyToken(token)
    ctx.adminId = payload.adminId
    ctx.userId = payload.adminId // For audit logging
  } catch (error) {
    throw new AuthError("Invalid token")
  }
}

export function requireAuth(ctx: RequestContext): void {
  if (!ctx.adminId) {
    throw new AuthError("Authentication required")
  }
}
