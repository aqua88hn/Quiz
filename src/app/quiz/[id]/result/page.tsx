"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

interface SubmitAnswer {
  questionId: string
  selected: number[]
}

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string
  const [scorePercent, setScorePercent] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function calc() {
      try {
        setLoading(true)
        setError(null)

        const stored = sessionStorage.getItem("quizAnswers")
        if (!stored) {
          // Không có đáp án để chấm => quay lại làm bài
          router.replace(`/quiz/${quizId}`)
          return
        }
        const answers: SubmitAnswer[] = JSON.parse(stored)

        // Gọi API để chấm điểm bằng dữ liệu trong Postgres
        const res = await fetch(`/api/v1/quizzes/${encodeURIComponent(quizId)}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        })
        const json = await res.json()

        if (!res.ok || !json?.success) {
          throw new Error(json?.error || "Failed to evaluate answers")
        }

        const data = json.data as {
          scorePercent: number
          correctCount: number
          total: number
        }

        setScorePercent(data.scorePercent || 0)
        setCorrectCount(data.correctCount || 0)
        setTotalCount(data.total || answers.length || 0)
      } catch (e: any) {
        console.error("result evaluate error:", e)
        setError(e?.message || "Failed to calculate result")
      } finally {
        setLoading(false)
      }
    }
    if (quizId) calc()
  }, [quizId, router])

  const getMessage = () => {
    if (scorePercent === 100) return "Amazing work!"
    if (scorePercent >= 80) return "Great job!"
    if (scorePercent >= 60) return "Good effort!"
    return "Keep practicing!"
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="text-slate-300">Calculating result...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="text-red-400">{error}</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-white mb-4">Quiz</h1>

          <div className="bg-slate-800 rounded-lg p-12 border border-slate-700">
            <h2 className="text-4xl font-bold text-white mb-2">{getMessage()}</h2>
            <p className="text-xl text-slate-300 mb-8">You got {scorePercent}% right.</p>

            <div className="mb-8 text-slate-400">
              <p className="text-lg">
                Correct answers:{" "}
                <span className="text-emerald-400 font-semibold">
                  {correctCount}/{totalCount}
                </span>
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href={`/quiz/${quizId}/review`}
                className="block w-full py-3 px-6 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium text-center"
              >
                Review explanations
              </Link>

              <Link
                href="/"
                className="block w-full py-3 px-6 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium text-center"
              >
                Take another quiz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
