"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface Question {
  id: string
  question: string
  options: string[]
  explanation?: string
}

interface SubmitAnswer {
  questionId: string
  selected: number[]
}

interface SubmitDetail {
  questionId: string
  correct: boolean
  correctOptions: number[]
  explanation?: string | null
}

export default function ReviewPage() {
  const params = useParams()
  const quizId = params.id as string

  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<SubmitAnswer[]>([])
  const [details, setDetails] = useState<SubmitDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)

        // 1) lấy câu hỏi từ API (để hiển thị nội dung + options)
        const resQuiz = await fetch(`/api/v1/quizzes/${encodeURIComponent(quizId)}`)
        const jsonQuiz = await resQuiz.json()
        if (!resQuiz.ok || !jsonQuiz?.success) throw new Error(jsonQuiz?.error || "Failed to load quiz")
        const qs: Question[] = (jsonQuiz.data?.questions || []).map((q: any) => ({
          id: String(q.id),
          question: q.question,
          options: Array.isArray(q.options) ? q.options : q.options ? JSON.parse(q.options) : [],
          explanation: q.explanation || "",
        }))
        setQuestions(qs)

        // 2) lấy answers từ sessionStorage rồi gọi submit API để lấy đáp án đúng
        const storedAnswers = sessionStorage.getItem("quizAnswers")
        const parsed: SubmitAnswer[] = storedAnswers ? JSON.parse(storedAnswers) : []
        setAnswers(parsed)

        if (parsed.length > 0) {
          const resSubmit = await fetch(`/api/v1/quizzes/${encodeURIComponent(quizId)}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers: parsed }),
          })
          const jsonSubmit = await resSubmit.json()
          if (!resSubmit.ok || !jsonSubmit?.success) {
            throw new Error(jsonSubmit?.error || "Failed to evaluate answers")
          }
          setDetails((jsonSubmit.data?.details as SubmitDetail[]) || [])
        } else {
          setDetails([])
        }
      } catch (e: any) {
        console.error("review load error:", e)
        setError(e?.message || "Failed to load review")
      } finally {
        setLoading(false)
      }
    }
    if (quizId) load()
  }, [quizId])

  const byId = useMemo(() => {
    const map = new Map(details.map((d) => [d.questionId, d]))
    return map
  }, [details])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href={`/quiz/${quizId}/result`} className="text-slate-400 hover:text-white mb-4 inline-block">
            ← Back to Result
          </Link>
          <h1 className="text-3xl font-bold text-white">Review Answers</h1>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => {
            const ans = answers.find((a) => a.questionId === question.id)
            const selected = ans?.selected || []
            const detail = byId.get(question.id)
            const isCorrect = detail?.correct ?? false
            const correctAnswerIndices = detail?.correctOptions || []

            return (
              <div
                key={question.id}
                className={`p-6 rounded-lg border-2 ${
                  isCorrect ? "bg-slate-800 border-emerald-500" : "bg-slate-800 border-red-500"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex-1">
                    {index + 1}. {question.question}
                  </h3>
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded whitespace-nowrap ml-2 ${
                      isCorrect ? "bg-emerald-900 text-emerald-100" : "bg-red-900 text-red-100"
                    }`}
                  >
                    {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-3">Your answer:</p>
                  <div className="space-y-2">
                    {question.options.map((option, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded ${
                          selected.includes(idx) ? "bg-blue-900 text-blue-100" : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {option}
                        {selected.includes(idx) && " ✓"}
                      </div>
                    ))}
                  </div>
                </div>

                {!isCorrect && correctAnswerIndices.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-400 mb-2">Correct answer:</p>
                    <div className="p-3 rounded bg-emerald-900 text-emerald-100">
                      {correctAnswerIndices.map((i) => question.options[i]).join(", ")}
                    </div>
                  </div>
                )}

                <div className="bg-slate-700 p-4 rounded">
                  <p className="text-sm font-semibold text-slate-300 mb-2">Explanation</p>
                  <p className="text-slate-200">{detail?.explanation || question.explanation || ""}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex gap-3">
          <Link
            href="/"
            className="flex-1 py-3 px-6 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium text-center"
          >
            Take another quiz
          </Link>
        </div>
      </div>
    </main>
  )
}
