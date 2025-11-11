"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AdminQuizCard } from "@/components/admin-quiz-card"

interface Quiz {
  id: string
  title: string
  description: string
  questionCount: number
  difficulty: string
}

export default function AdminPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewQuizForm, setShowNewQuizForm] = useState(false)
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    difficulty: "Beginner",
  })

  useEffect(() => {
    // Fetch quizzes
    const mockQuizzes: Quiz[] = [
      {
        id: "python_keywords_expert",
        title: "Python Keywords Expert",
        description: "Advanced questions on Python reserved keywords",
        questionCount: 5,
        difficulty: "Expert",
      },
      {
        id: "python_basics",
        title: "Python Basics",
        description: "Fundamental concepts of Python programming",
        questionCount: 5,
        difficulty: "Beginner",
      },
    ]
    setQuizzes(mockQuizzes)
    setLoading(false)
  }, [])

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault()
    const id = newQuiz.title.toLowerCase().replace(/\s+/g, "_")
    const quiz: Quiz = {
      id,
      ...newQuiz,
      questionCount: 0,
    }
    setQuizzes([...quizzes, quiz])
    setNewQuiz({ title: "", description: "", difficulty: "Beginner" })
    setShowNewQuizForm(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">Manage quizzes and questions</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
            ← Back to Home
          </Link>
        </div>

        {showNewQuizForm && (
          <div className="mb-8 p-6 bg-slate-800 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Create New Quiz</h2>
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Quiz Title</label>
                <input
                  type="text"
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
                  placeholder="Enter quiz title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={newQuiz.description}
                  onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
                  placeholder="Enter quiz description"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                <select
                  value={newQuiz.difficulty}
                  onChange={(e) => setNewQuiz({ ...newQuiz, difficulty: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Expert</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Create Quiz
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewQuizForm(false)}
                  className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {!showNewQuizForm && (
          <button
            onClick={() => setShowNewQuizForm(true)}
            className="mb-8 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            + Create New Quiz
          </button>
        )}

        <div className="grid gap-6">
          {quizzes.map((quiz) => (
            <Link key={quiz.id} href={`/admin/quiz/${quiz.id}`}>
              <AdminQuizCard quiz={quiz} />
            </Link>
          ))}
        </div>

        {quizzes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No quizzes yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </main>
  )
}
