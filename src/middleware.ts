import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Protect admin routes
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("adminToken")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
