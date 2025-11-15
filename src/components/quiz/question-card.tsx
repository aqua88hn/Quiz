"use client"

interface QuestionCardProps {
  question: {
    id: string
    question: string
    options: string[]
    type: "singleSelect" | "multiSelect"
  }
  selectedAnswers: number[]
  onSelectAnswer: (optionIndex: number) => void
}

export function QuestionCard({ question, selectedAnswers, onSelectAnswer }: QuestionCardProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-6">{question.question}</h2>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelectAnswer(index)}
            className={`w-full p-4 text-center rounded-lg font-medium transition-all duration-200 ${
              selectedAnswers.includes(index)
                ? "bg-white text-slate-900 border-2 border-emerald-500 shadow-lg"
                : "bg-slate-700 text-white border-2 border-slate-600 hover:border-slate-500 hover:bg-slate-600"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
