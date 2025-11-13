import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth-postgres"
import { AuthError, type RequestContext } from "./types"

export function attachAuthContext(request: NextRequest, ctx: RequestContext): void {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) return

  const token = authHeader.replace(/^Bearer\s+/i, "")
  const payload = verifyToken(token)
  if (!payload) {
    throw new AuthError("Invalid token")
  }

  // auth-postgres payload includes userId, username, role
  // set both userId and adminId (if role === admin) for downstream checks
  // ensure types exist on RequestContext
  ctx.userId = (payload as any).userId ?? null
  if ((payload as any).role === "admin") {
    ctx.adminId = (payload as any).userId
  } else {
    ctx.adminId = null
  }
}

export function requireAuth(ctx: RequestContext): void {
  if (!ctx.userId) {
    throw new AuthError("Authentication required")
  }
}

export function requireAdmin(ctx: RequestContext): void {
  if (!ctx.adminId) {
    throw new AuthError("Admin authentication required")
  }
}
