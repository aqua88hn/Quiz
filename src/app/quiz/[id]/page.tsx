"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { QuestionCard } from "@/components/question-card"
import { ProgressBar } from "@/components/progress-bar"
import { Navigation } from "@/components/navigation"

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

  useEffect(() => {
    // Fetch quiz data
    const mockQuiz: Quiz = {
      id: quizId,
      title: quizId === "python_keywords_expert" ? "Python Keywords Expert" : "Python Basics",
      questions: [
        {
          id: "q1",
          question: "Từ khóa nào dùng để định nghĩa một hàm trong Python?",
          options: ["function", "def", "lambda", "define"],
          type: "singleSelect",
          explanation: 'Từ khóa "def" được sử dụng để định nghĩa một hàm trong Python.',
        },
        {
          id: "q2",
          question: "Từ khóa nào dùng để tạo một hàm bất động bộ?",
          options: ["async", "await", "def", "thread"],
          type: "singleSelect",
          explanation: 'Từ khóa "async" được sử dụng để định nghĩa một hàm bất động bộ trong Python.',
        },
        {
          id: "q3",
          question: 'Từ khóa "yield" thường được dùng trong loại hàm nào?',
          options: ["Hàm bình thường", "Generator", "Hàm lambda", "Async function"],
          type: "singleSelect",
          explanation: '"yield" được sử dụng trong các hàm generator để trả về các giá trị một lần một.',
        },
        {
          id: "q4",
          question: "Cách nào để tạo một hàm với số lượng đối số không xác định?",
          options: ["*args", "**kwargs", "Cả hai *args và **kwargs", "Không thể làm được"],
          type: "multiSelect",
          explanation: "Cả *args và **kwargs đều có thể được sử dụng để tạo hàm với số lượng đối số không xác định.",
        },
        {
          id: "q5",
          question: "Từ khóa nào dùng để xử lý ngoại lệ trong Python?",
          options: ["try-catch", "try-except", "error-handle", "handle-error"],
          type: "singleSelect",
          explanation: 'Từ khóa "try-except" được sử dụng để xử lý ngoại lệ trong Python.',
        },
      ],
    }

    setQuiz(mockQuiz)
    setLoading(false)
  }, [quizId])

  if (loading || !quiz) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const question = quiz.questions[currentQuestion]
  const totalQuestions = quiz.questions.length
  const isLastQuestion = currentQuestion === totalQuestions - 1

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestion(currentQuestion + 1)
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
      setCurrentQuestion(currentQuestion - 1)
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
      <div className="container max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Quiz</h1>
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
