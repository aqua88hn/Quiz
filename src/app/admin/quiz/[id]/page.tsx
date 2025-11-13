"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
  const router = useRouter()
  const quizId = params.id as string
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!quizId) return
    setLoading(true)
    setError(null);
    (async () => {
      try {
        const res = await fetch(`/api/v1/quizzes/${encodeURIComponent(quizId)}`)
        const json = await res.json()
        if (!res.ok || !json?.success) {
          throw new Error(json?.error || "Failed to load quiz")
        }
        const data = json.data
        setQuiz({ id: data.id, title: data.title, description: data.description || "" })
        const qs: Question[] = (data.questions || []).map((q: any) => ({
          id: String(q.id),
          question: q.question,
          options: Array.isArray(q.options) ? q.options : q.options ? JSON.parse(q.options) : [],
          answer: Array.isArray(q.answer) ? q.answer : [],
          explanation: q.explanation || "",
          type: q.type === "multiSelect" ? "multiSelect" : "singleSelect",
        }))
        setQuestions(qs)
      } catch (e: any) {
        console.error("load quiz error:", e)
        setError(e?.message || "Failed to load quiz")
        setQuiz(null)
        setQuestions([])
      } finally {
        setLoading(false)
      }
    })()
  }, [quizId])

  const handleAddQuestion = async (newQuestion: Omit<Question, "id">) => {
    try {
      const res = await fetch(`/api/v1/quizzes/${encodeURIComponent(quizId)}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Failed to create question")
      }
      const created = json.data as any
      const q: Question = {
        id: String(created.id),
        question: created.question,
        options: Array.isArray(created.options) ? created.options : created.options ? JSON.parse(created.options) : [],
        answer: Array.isArray(created.answer) ? created.answer : [],
        explanation: created.explanation || "",
        type: created.type === "multiSelect" ? "multiSelect" : "singleSelect",
      }
      setQuestions((s) => [...s, q])
      setShowForm(false)
    } catch (e: any) {
      console.error("create question error:", e)
      alert(e?.message || "Failed to create question")
    }
  }

  const handleEditQuiz = async () => {
    if (!quiz) return
    const title = window.prompt("Edit title", quiz.title) ?? quiz.title
    const description = window.prompt("Edit description", quiz.description || "") ?? (quiz.description || "")
    try {
      const res = await fetch(`/api/v1/quizzes/${encodeURIComponent(quizId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to update quiz")
      setQuiz((q) => (q ? { ...q, title: json.data.title, description: json.data.description || "" } : q))
    } catch (e: any) {
      alert(e?.message || "Update quiz failed")
    }
  }

  const handleDeleteQuiz = async () => {
    if (!confirm("Delete this quiz? All questions will be removed.")) return
    try {
      const res = await fetch(`/api/v1/quizzes/${encodeURIComponent(quizId)}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to delete quiz")
      router.push("/admin")
    } catch (e: any) {
      alert(e?.message || "Delete quiz failed")
    }
  }

  const handleEditQuestion = async (q: Question) => {
    const question = window.prompt("Edit question", q.question) ?? q.question
    const optionsStr = window.prompt("Edit options (comma separated)", q.options.join(", ")) ?? q.options.join(", ")
    const answerStr =
        window.prompt("Edit correct indices (comma separated, 0-based)", q.answer.join(", ")) ?? q.answer.join(", ")
    const promptExplanation = window.prompt("Edit explanation", q.explanation || "")
    const explanation = promptExplanation ?? (q.explanation || "")
    const type = window.prompt("Type: singleSelect | multiSelect", q.type) ?? q.type

    const options = optionsStr.split(",").map((s) => s.trim()).filter(Boolean)
    const answer = answerStr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map((n) => Number(n))

    try {
      const res = await fetch(
        `/api/v1/quizzes/${encodeURIComponent(quizId)}/questions/${encodeURIComponent(q.id)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, options, answer, explanation, type }),
        },
      )
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to update question")

      setQuestions((prev) => prev.map((it) => (it.id === q.id ? { ...it, ...json.data } : it)))
    } catch (e: any) {
      alert(e?.message || "Update question failed")
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Delete this question?")) return
    try {
      const res = await fetch(
        `/api/v1/quizzes/${encodeURIComponent(quizId)}/questions/${encodeURIComponent(questionId)}`,
        { method: "DELETE" },
      )
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to delete question")
      setQuestions((qs) => qs.filter((x) => x.id !== questionId))
    } catch (e: any) {
      alert(e?.message || "Delete question failed")
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  if (error || !quiz) {
    return <div className="flex items-center justify-center min-h-screen text-red-400">{error || "Quiz not found"}</div>
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-slate-400 hover:text-white">
            ← Back to Admin
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleEditQuiz}
              className="px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
            >
              Edit quiz
            </button>
            <button
              onClick={handleDeleteQuiz}
              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete quiz
            </button>
          </div>
        </div>

        <h1 className="mt-4 text-3xl font-bold text-white">{quiz?.title}</h1>
        <p className="text-slate-400 mb-6">{quiz?.description}</p>

        {showForm ? (
          <QuestionForm
            onSubmit={async (q) => {
              await handleAddQuestion(q as any)
              setShowForm(false)
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            + Add Question
          </button>
        )}

        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="relative">
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  onClick={() => handleEditQuestion(q)}
                  className="px-2 py-1 text-sm bg-slate-700 text-white rounded hover:bg-slate-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
              <AdminQuestionCard question={q} index={i}/>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
