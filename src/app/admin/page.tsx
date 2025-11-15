"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AdminQuizCard } from "@/components/admin/admin-quiz-card"
import { httpClient } from '@/lib/httpClient'

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
    questionCount: 0,
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const json = await httpClient.getJson<any>('/api/v1/quizzes')
        if (!json?.success) throw new Error(json?.error || "Failed to load quizzes")

        const data: any[] = json.data || []
        if (ignore) return
        setQuizzes(
          data.map((q) => ({
            id: String(q.id),
            title: q.title,
            description: q.description || "",
            questionCount: Number(q.question_count ?? q.questionCount ?? 0),
            difficulty: q.difficulty || "Beginner",
          })),
        )
      } catch (e: any) {
        console.error("[Admin] load quizzes error:", e)
        setError(e?.message || "Failed to load quizzes")
        setQuizzes([])
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      ignore = true
    }
  }, [])

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        title: newQuiz.title,
        description: newQuiz.description,
        question_count: Number(newQuiz.questionCount) || 0,
        difficulty: newQuiz.difficulty,
      }
      const res = await httpClient.request('/api/v1/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Failed to create quiz")
      }
      const created = json.data as any
      const quiz: Quiz = {
        id: String(created.id),
        title: created.title,
        description: created.description || "",
        questionCount: Number(created.question_count ?? 0),
        difficulty: created.difficulty || newQuiz.difficulty,
      }
      setQuizzes((prev) => [quiz, ...prev])
      setNewQuiz({ title: "", description: "", difficulty: "Beginner", questionCount: 0 })
      setShowNewQuizForm(false)
    } catch (e: any) {
      console.error("[Admin] create quiz error:", e)
      alert(e?.message || "Create quiz failed")
    }
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

        {error && (
          <div className="mb-4 rounded bg-red-900/40 border border-red-700 text-red-200 px-4 py-3">
            {error}
          </div>
        )}

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

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                  <select
                    id="difficulty"
                    value={newQuiz.difficulty}
                    onChange={(e) => setNewQuiz({ ...newQuiz, difficulty: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Expert</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="questionCount" className="block text-sm font-medium text-slate-300 mb-2">Question count</label>
                  <input
                    id="questionCount"
                    type="number"
                    min={0}
                    value={newQuiz.questionCount}
                    onChange={(e) => setNewQuiz({ ...newQuiz, questionCount: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
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
