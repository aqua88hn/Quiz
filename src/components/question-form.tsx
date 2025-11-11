"use client"

import type React from "react"

import { useState } from "react"

interface QuestionFormProps {
  onSubmit: (question: any) => void
  onCancel: () => void
}

export function QuestionForm({ onSubmit, onCancel }: QuestionFormProps) {
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", "", "", ""])
  const [answer, setAnswer] = useState<number[]>([])
  const [explanation, setExplanation] = useState("")
  const [type, setType] = useState<"singleSelect" | "multiSelect">("singleSelect")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question || options.some((o) => !o) || answer.length === 0) {
      alert("Please fill in all fields")
      return
    }

    onSubmit({
      question,
      options,
      answer,
      explanation,
      type,
    })

    // Reset form
    setQuestion("")
    setOptions(["", "", "", ""])
    setAnswer([])
    setExplanation("")
    setType("singleSelect")
  }

  const toggleAnswer = (index: number) => {
    if (type === "singleSelect") {
      setAnswer([index])
    } else {
      if (answer.includes(index)) {
        setAnswer(answer.filter((a) => a !== index))
      } else {
        setAnswer([...answer, index])
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-slate-800 rounded-lg border border-slate-700 space-y-4">
      <h2 className="text-xl font-semibold text-white mb-4">Add New Question</h2>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
          placeholder="Enter question text"
          rows={2}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Question Type</label>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as "singleSelect" | "multiSelect")
            setAnswer([])
          }}
          className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
        >
          <option value="singleSelect">Single Select</option>
          <option value="multiSelect">Multi Select</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Options</label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...options]
                  newOptions[index] = e.target.value
                  setOptions(newOptions)
                }}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
                placeholder={`Option ${index + 1}`}
                required
              />
              <button
                type="button"
                onClick={() => toggleAnswer(index)}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  answer.includes(index)
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {answer.includes(index) ? "✓" : "Mark"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Explanation</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
          placeholder="Explain the correct answer"
          rows={3}
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          Add Question
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
