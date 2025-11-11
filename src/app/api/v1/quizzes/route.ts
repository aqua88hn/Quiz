import { type NextRequest, NextResponse } from "next/server"
import { getQuizzes } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const quizzes = getQuizzes()
    return NextResponse.json({ success: true, data: quizzes })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch quizzes" }, { status: 500 })
  }
}
