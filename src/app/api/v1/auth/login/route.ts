import { type NextRequest, NextResponse } from "next/server"
import { validateUserLogin, generateToken } from "@/lib/auth-postgres"
import { asyncWrapper } from "@/lib/middleware/asyncWrapper"
import type { RequestContext } from "@/lib/middleware/types"
import { ValidationError, AuthError } from "@/lib/middleware/types"
import { createAuditLog } from "@/lib/datalayer/db-users"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body || {}

    if (!username || !password) {
      return new Response(JSON.stringify({ error: "Missing username or password" }), { status: 400 })
    }

    const user = await validateUserLogin(username, password)
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 })
    }

    const token = generateToken(user.id, user.username, user.role)
    return new Response(JSON.stringify({ token, user: { id: user.id, username: user.username, role: user.role } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("Login route error:", err)
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 })
  }
}

// Nếu cần hỗ trợ GET (ví dụ health), export thêm:
export async function GET() {
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } })
}
