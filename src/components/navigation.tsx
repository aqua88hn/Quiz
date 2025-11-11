"use client"

interface NavigationProps {
  onPrevious: () => void
  onNext: () => void
  currentQuestion: number
  totalQuestions: number
  isLastQuestion: boolean
}

export function Navigation({ onPrevious, onNext, currentQuestion, isLastQuestion }: NavigationProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <button
        onClick={onPrevious}
        disabled={currentQuestion === 0}
        className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ← Previous
      </button>

      <button
        onClick={onNext}
        className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
      >
        {isLastQuestion ? (
          <>
            <span>✓</span> Submit
          </>
        ) : (
          <>Next →</>
        )}
      </button>
    </div>
  )
}
