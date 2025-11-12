import { type NextRequest, NextResponse } from "next/server"
import { asyncWrapper } from "@/lib/middleware/asyncWrapper"
import { getAllUsers } from "@/lib/db-users"
import type { RequestContext } from "@/lib/middleware/types"

async function GET(request: NextRequest, ctx: RequestContext) {
  if ((ctx.userId as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const url = new URL(request.url)
  const limit = Number.parseInt(url.searchParams.get("limit") || "50")
  const offset = Number.parseInt(url.searchParams.get("offset") || "0")

  const users = await getAllUsers(limit, offset)

  return NextResponse.json({
    success: true,
    requestId: ctx.requestId,
    data: users,
  })
}

export const GET_HANDLER = asyncWrapper(GET)
