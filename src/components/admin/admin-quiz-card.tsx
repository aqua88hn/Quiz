interface AdminQuizCardProps {
  quiz: {
    id: string
    title: string
    description: string
    questionCount: number
    difficulty: string
  }
}

export function AdminQuizCard({ quiz }: AdminQuizCardProps) {
  return (
    <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-1">{quiz.title}</h3>
          <p className="text-slate-400 text-sm mb-2">{quiz.description}</p>
        </div>
        <span
          className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ml-4 ${
            quiz.difficulty === "Expert"
              ? "bg-red-900 text-red-100"
              : quiz.difficulty === "Intermediate"
                ? "bg-yellow-900 text-yellow-100"
                : "bg-blue-900 text-blue-100"
          }`}
        >
          {quiz.difficulty}
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <span className="text-sm text-slate-400">{quiz.questionCount} questions</span>
        <span className="text-emerald-400 text-sm font-medium">Edit →</span>
      </div>
    </div>
  )
}
