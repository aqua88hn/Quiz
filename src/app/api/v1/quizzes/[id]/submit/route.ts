import { type NextRequest, NextResponse } from "next/server"
import { submitAnswers, type Answer } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { answers } = body

    if (!Array.isArray(answers)) {
      return NextResponse.json({ success: false, error: "Invalid answers format" }, { status: 400 })
    }

    const result = submitAnswers(id, answers as Answer[])

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to submit answers" }, { status: 500 })
  }
}
