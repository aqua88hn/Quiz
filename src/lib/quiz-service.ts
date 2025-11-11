export interface QuizData {
  id: string
  title: string
  description: string
  questionCount: number
  difficulty: string
}

export interface QuestionData {
  id: string
  question: string
  options: string[]
  type: "singleSelect" | "multiSelect"
  explanation: string
}

export interface QuizWithQuestions extends QuizData {
  questions: QuestionData[]
}

export async function fetchQuizzes(): Promise<QuizData[]> {
  const response = await fetch("/api/v1/quizzes")
  if (!response.ok) throw new Error("Failed to fetch quizzes")
  const { data } = await response.json()
  return data
}

export async function fetchQuizById(id: string): Promise<QuizWithQuestions> {
  const response = await fetch(`/api/v1/quizzes/${id}`)
  if (!response.ok) throw new Error("Failed to fetch quiz")
  const { data } = await response.json()
  return data
}

export async function submitQuizAnswers(quizId: string, answers: Array<{ questionId: string; selected: number[] }>) {
  const response = await fetch(`/api/v1/quizzes/${quizId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  })
  if (!response.ok) throw new Error("Failed to submit answers")
  const { data } = await response.json()
  return data
}
