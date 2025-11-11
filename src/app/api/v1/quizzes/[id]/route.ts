import { type NextRequest, NextResponse } from "next/server"
import { getQuizById, getQuestionsByQuizId } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const quiz = getQuizById(id)

    if (!quiz) {
      return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 })
    }

    const questions = getQuestionsByQuizId(id)

    return NextResponse.json({
      success: true,
      data: {
        ...quiz,
        questions,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch quiz" }, { status: 500 })
  }
}
