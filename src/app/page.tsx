import Link from "next/link"
import { QuizCard } from "@/components/quiz-card"

const quizzes = [
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

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">QuizMate</h1>
          <p className="text-slate-300">Test your knowledge with our interactive quizzes</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <Link key={quiz.id} href={`/quiz/${quiz.id}`}>
              <QuizCard quiz={quiz} />
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
