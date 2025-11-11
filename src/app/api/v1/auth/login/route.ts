import { type NextRequest, NextResponse } from "next/server"
import { generateToken, validateAdminPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ success: false, error: "Password required" }, { status: 400 })
    }

    if (!validateAdminPassword(password)) {
      return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 })
    }

    const token = generateToken("admin")
    return NextResponse.json({
      success: true,
      data: { token },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 })
  }
}
