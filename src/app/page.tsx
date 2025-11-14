import Link from "next/link"
import { QuizCard } from "@/components/quiz-card"
import { getQuizzes } from "@/lib/db-quiz-question"

export const dynamic = "force-dynamic"

type QuizListItem = {
  id: string
  title: string
  description?: string | null
  question_count?: number
  created_at?: string
  difficulty?: "Beginner" | "Intermediate" | "Expert" | string
}

export default async function Home() {
  let rows: QuizListItem[] = []
  try {
    rows = await getQuizzes()
  } catch (e) {
    console.error("[Home] load quizzes failed:", e)
  }

  const quizzes = (rows || []).map((q) => ({
    id: String(q.id),
    title: q.title,
    description: q.description || "",
    questionCount: Number(q.question_count ?? 0),
    difficulty:
      q.difficulty && ["Beginner", "Intermediate", "Expert"].includes(q.difficulty)
        ? q.difficulty
        : "Beginner",
  }))

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">QuizMate</h1>
          <p className="text-slate-300">Test your knowledge with our interactive quizzes</p>
        </div>

        {quizzes.length === 0 ? (
          <div className="text-slate-400">No quizzes yet. Go to Admin to create one.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {quizzes.map((quiz) => (
              <Link key={quiz.id} href={`/quiz/${quiz.id}`}>
                <QuizCard quiz={quiz} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
