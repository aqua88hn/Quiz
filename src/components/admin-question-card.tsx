"use client"

interface AdminQuestionCardProps {
  question: {
    id: string
    question: string
    options: string[]
    answer: number[]
    type: string
    explanation: string
  }
  index: number
  onDelete: () => void
}

export function AdminQuestionCard({ question, index, onDelete }: AdminQuestionCardProps) {
  return (
    <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            {index + 1}. {question.question}
          </h3>
        </div>
        <button onClick={onDelete} className="text-red-400 hover:text-red-300 text-sm ml-4">
          Delete
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {question.options.map((option, idx) => (
          <div
            key={idx}
            className={`p-2 text-sm rounded ${
              question.answer.includes(idx) ? "bg-emerald-900 text-emerald-100" : "bg-slate-700 text-slate-300"
            }`}
          >
            {option}
            {question.answer.includes(idx) && " ✓"}
          </div>
        ))}
      </div>

      <div className="bg-slate-700 p-3 rounded mb-3">
        <p className="text-xs text-slate-400 mb-1">Explanation</p>
        <p className="text-sm text-slate-200">{question.explanation}</p>
      </div>

      <div className="flex gap-2">
        <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
          {question.type === "multiSelect" ? "Multi-select" : "Single-select"}
        </span>
      </div>
    </div>
  )
}
