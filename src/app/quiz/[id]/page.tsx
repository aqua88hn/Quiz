"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { QuestionCard } from "@/components/question-card"
import { ProgressBar } from "@/components/progress-bar"
import { Navigation } from "@/components/navigation"
import { httpClient } from '@/lib/httpClient'

interface Question {
  id: string
  question: string
  options: string[]
  type: "singleSelect" | "multiSelect"
  explanation: string
}

interface Quiz {
  id: string
  title: string
  questions: Question[]
}

export default function QuizPage() {
  const params = useParams()
  const quizId = params.id as string
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: number[] }>({})
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!quizId) return
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const json = await httpClient.getJson<any>(`/api/v1/quizzes/${encodeURIComponent(quizId)}`)
        if (json?.success && json.data) {
          const data = json.data
          const questions: Question[] = (data.questions || []).map((q: any) => ({
            id: String(q.id),
            question: q.question,
            options: Array.isArray(q.options) ? q.options : q.options ? JSON.parse(q.options) : [],
            type: q.type === "multiSelect" ? "multiSelect" : "singleSelect",
            explanation: q.explanation || "",
          }))
          setQuiz({ id: data.id, title: data.title, questions })
        } else {
          setError(json?.error || "Quiz not found")
          setQuiz(null)
        }
      } catch (e) {
        console.error("load quiz error", e)
        setError("Failed to load quiz")
        setQuiz(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [quizId])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-400">{error}</div>
  }
  if (!quiz) {
    return <div className="flex items-center justify-center min-h-screen">Quiz not found</div>
  }

  const question = quiz.questions[currentQuestion]
  const totalQuestions = quiz.questions.length
  const isLastQuestion = currentQuestion === totalQuestions - 1

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestion((s) => s + 1)
    } else {
      // Submit quiz
      const submitAnswers = quiz.questions.map((q) => ({
        questionId: q.id,
        selected: answers[q.id] || [],
      }))

      // Store answers and redirect to result
      sessionStorage.setItem("quizAnswers", JSON.stringify(submitAnswers))
      sessionStorage.setItem("quizId", quizId)
      window.location.href = `/quiz/${quizId}/result`
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((s) => s - 1)
    }
  }

  const handleSelectAnswer = (optionIndex: number) => {
    const questionId = question.id
    const current = answers[questionId] || []

    if (question.type === "singleSelect") {
      setAnswers({
        ...answers,
        [questionId]: [optionIndex],
      })
    } else {
      if (current.includes(optionIndex)) {
        setAnswers({
          ...answers,
          [questionId]: current.filter((i) => i !== optionIndex),
        })
      } else {
        setAnswers({
          ...answers,
          [questionId]: [...current, optionIndex],
        })
      }
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
            <button className="text-slate-400 hover:text-white">
              <span className="text-2xl">✏️</span>
            </button>
          </div>

          <ProgressBar current={currentQuestion + 1} total={totalQuestions} />
        </div>

        <QuestionCard
          question={question}
          selectedAnswers={answers[question.id] || []}
          onSelectAnswer={handleSelectAnswer}
        />

        <Navigation
          onPrevious={handlePrevious}
          onNext={handleNext}
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          isLastQuestion={isLastQuestion}
        />
      </div>
    </main>
  )
}
