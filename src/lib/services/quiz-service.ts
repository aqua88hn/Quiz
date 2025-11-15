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
import { httpClient } from '@/lib/httpClient'

export async function fetchQuizzes(): Promise<QuizData[]> {
  const json = await httpClient.getJson<{ data: QuizData[] }>('/api/v1/quizzes')
  return json.data
}

export async function fetchQuizById(id: string): Promise<QuizWithQuestions> {
  const json = await httpClient.getJson<{ data: QuizWithQuestions }>(`/api/v1/quizzes/${id}`)
  return json.data
}

export async function submitQuizAnswers(quizId: string, answers: Array<{ questionId: string; selected: number[] }>) {
  const res = await httpClient.request(`/api/v1/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  }, { retries: 1 })

  const json = await res.json()
  return json.data
}
