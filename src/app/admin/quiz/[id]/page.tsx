"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { AdminQuestionCard } from "@/components/admin-question-card"
import { QuestionForm } from "@/components/question-form"

interface Question {
  id: string
  question: string
  options: string[]
  answer: number[]
  explanation: string
  type: "singleSelect" | "multiSelect"
}

interface Quiz {
  id: string
  title: string
  description: string
}

export default function AdminQuizPage() {
  const params = useParams()
  const quizId = params.id as string
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock quiz and questions data
    const mockQuiz: Quiz = {
      id: quizId,
      title: quizId === "python_keywords_expert" ? "Python Keywords Expert" : "Python Basics",
      description: "Quiz description",
    }

    const mockQuestions: Question[] =
      quizId === "python_keywords_expert"
        ? [
            {
              id: "q1",
              question: "Từ khóa nào dùng để định nghĩa một hàm trong Python?",
              options: ["function", "def", "lambda", "define"],
              answer: [1],
              type: "singleSelect",
              explanation: 'Từ khóa "def" được sử dụng để định nghĩa một hàm trong Python.',
            },
            {
              id: "q2",
              question: "Từ khóa nào dùng để tạo một hàm bất động bộ?",
              options: ["async", "await", "def", "thread"],
              answer: [0],
              type: "singleSelect",
              explanation: 'Từ khóa "async" được sử dụng để định nghĩa một hàm bất động bộ trong Python.',
            },
          ]
        : [
            {
              id: "q6",
              question: "Cách nào để tạo một danh sách trong Python?",
              options: ["{}", "[]", "()", "list()"],
              answer: [1, 3],
              type: "multiSelect",
              explanation: "Cả [] và list() đều có thể được sử dụng để tạo một danh sách trong Python.",
            },
          ]

    setQuiz(mockQuiz)
    setQuestions(mockQuestions)
    setLoading(false)
  }, [quizId])

  const handleAddQuestion = (newQuestion: Question) => {
    setQuestions([...questions, { ...newQuestion, id: `q${questions.length + 1}` }])
    setShowForm(false)
  }

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId))
  }

  if (loading || !quiz) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-slate-400 hover:text-white mb-4 inline-block">
            ← Back to Admin
          </Link>

          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-white">{quiz.title}</h1>
            <button className="text-slate-400 hover:text-white text-xl">✏️</button>
          </div>

          <p className="text-slate-400">{quiz.description}</p>
        </div>

        {showForm && (
          <div className="mb-8">
            <QuestionForm onSubmit={handleAddQuestion} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            + Add Question
          </button>
        )}

        <div className="space-y-4">
          {questions.map((question, index) => (
            <AdminQuestionCard
              key={question.id}
              question={question}
              index={index}
              onDelete={() => handleDeleteQuestion(question.id)}
            />
          ))}
        </div>

        {questions.length === 0 && (
          <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400">No questions yet. Add one to get started!</p>
          </div>
        )}
      </div>
    </main>
  )
}
