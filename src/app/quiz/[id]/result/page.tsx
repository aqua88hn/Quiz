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

  useEffect(() => {
    // Calculate score based on stored answers
    const storedAnswers = sessionStorage.getItem("quizAnswers")

    // Mock correct answers for demo
    const correctAnswers: { [key: string]: number[] } = {
      q1: [1], // def
      q2: [0], // async
      q3: [1], // Generator
      q4: [0, 1], // *args and **kwargs
      q5: [1], // try-except
    }

    if (storedAnswers) {
      const answers: SubmitAnswer[] = JSON.parse(storedAnswers)
      let correct = 0

      answers.forEach((answer) => {
        const expectedAnswer = correctAnswers[answer.questionId] || []
        const isCorrect =
          answer.selected.length === expectedAnswer.length &&
          answer.selected.sort().every((v, i) => v === expectedAnswer.sort()[i])

        if (isCorrect) correct++
      })

      const percent = Math.round((correct / answers.length) * 100)
      setScorePercent(percent)
      setCorrectCount(correct)
      setTotalCount(answers.length)
    }
  }, [])

  const getMessage = () => {
    if (scorePercent === 100) return "Amazing work!"
    if (scorePercent >= 80) return "Great job!"
    if (scorePercent >= 60) return "Good effort!"
    return "Keep practicing!"
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
