"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface Question {
  id: string
  question: string
  options: string[]
  explanation: string
}

interface SubmitAnswer {
  questionId: string
  selected: number[]
}

export default function ReviewPage() {
  const params = useParams()
  const quizId = params.id as string
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<SubmitAnswer[]>([])
  const [correctAnswers] = useState<{ [key: string]: number[] }>({
    q1: [1],
    q2: [0],
    q3: [1],
    q4: [0, 1],
    q5: [1],
  })

  useEffect(() => {
    // Mock questions
    const mockQuestions: Question[] = [
      {
        id: "q1",
        question: "Từ khóa nào dùng để định nghĩa một hàm trong Python?",
        options: ["function", "def", "lambda", "define"],
        explanation: 'Từ khóa "def" được sử dụng để định nghĩa một hàm trong Python.',
      },
      {
        id: "q2",
        question: "Từ khóa nào dùng để tạo một hàm bất động bộ?",
        options: ["async", "await", "def", "thread"],
        explanation: 'Từ khóa "async" được sử dụng để định nghĩa một hàm bất động bộ trong Python.',
      },
      {
        id: "q3",
        question: 'Từ khóa "yield" thường được dùng trong loại hàm nào?',
        options: ["Hàm bình thường", "Generator", "Hàm lambda", "Async function"],
        explanation: '"yield" được sử dụng trong các hàm generator để trả về các giá trị một lần một.',
      },
      {
        id: "q4",
        question: "Cách nào để tạo một hàm với số lượng đối số không xác định?",
        options: ["*args", "**kwargs", "Cả hai *args và **kwargs", "Không thể làm được"],
        explanation: "Cả *args và **kwargs đều có thể được sử dụng để tạo hàm với số lượng đối số không xác định.",
      },
      {
        id: "q5",
        question: "Từ khóa nào dùng để xử lý ngoại lệ trong Python?",
        options: ["try-catch", "try-except", "error-handle", "handle-error"],
        explanation: 'Từ khóa "try-except" được sử dụng để xử lý ngoại lệ trong Python.',
      },
    ]

    setQuestions(mockQuestions)

    const storedAnswers = sessionStorage.getItem("quizAnswers")
    if (storedAnswers) {
      setAnswers(JSON.parse(storedAnswers))
    }
  }, [])

  const getIsCorrect = (questionId: string, selected: number[]) => {
    const expected = correctAnswers[questionId] || []
    return selected.length === expected.length && selected.sort().every((v, i) => v === expected.sort()[i])
  }

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
            const answer = answers.find((a) => a.questionId === question.id)
            const selected = answer?.selected || []
            const isCorrect = getIsCorrect(question.id, selected)
            const correctAnswerIndices = correctAnswers[question.id] || []

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

                {!isCorrect && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-400 mb-2">Correct answer:</p>
                    <div className="p-3 rounded bg-emerald-900 text-emerald-100">
                      {question.options[correctAnswerIndices[0]]}
                    </div>
                  </div>
                )}

                <div className="bg-slate-700 p-4 rounded">
                  <p className="text-sm font-semibold text-slate-300 mb-2">Explanation</p>
                  <p className="text-slate-200">{question.explanation}</p>
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
