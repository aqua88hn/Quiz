interface QuizCardProps {
  quiz: {
    id: string
    title: string
    description: string
    questionCount: number
    difficulty: string
  }
}

export function QuizCard({ quiz }: QuizCardProps) {
  return (
    <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer">
      <h3 className="text-xl font-semibold text-white mb-2">{quiz.title}</h3>
      <p className="text-slate-400 text-sm mb-4">{quiz.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-slate-500 text-sm">{quiz.questionCount} questions</span>
        <span
          className={`px-3 py-1 rounded text-sm font-medium ${
            quiz.difficulty === "Expert" ? "bg-red-900 text-red-100" : "bg-blue-900 text-blue-100"
          }`}
        >
          {quiz.difficulty}
        </span>
      </div>
    </div>
  )
}
