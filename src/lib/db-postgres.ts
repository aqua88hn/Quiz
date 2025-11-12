// PostgreSQL Database Layer
import { logger } from "./middleware/logger"

interface Question {
  id: string
  question: string
  options: string[]
  answer: number[]
  explanation: string
  type: "singleSelect" | "multiSelect"
  quizId: string
}

interface Quiz {
  id: string
  title: string
  description: string
  questionCount: number
  difficulty: string
}

interface Answer {
  questionId: string
  selected: number[]
}

interface SubmitResult {
  scorePercent: number
  correctCount: number
  total: number
  details: Array<{
    questionId: string
    correct: boolean
    correctOptions: number[]
    explanation: string
  }>
}

const cachedQuizzes: Quiz[] | null = null
const cachedQuestions: Question[] | null = null

// Fallback mock data in case DB connection fails
const mockQuizzes: Quiz[] = [
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

const mockQuestions: Question[] = [
  {
    id: "q1",
    quizId: "python_keywords_expert",
    question: "Từ khóa nào dùng để định nghĩa một hàm trong Python?",
    options: ["function", "def", "lambda", "define"],
    answer: [1],
    type: "singleSelect",
    explanation: 'Từ khóa "def" được sử dụng để định nghĩa một hàm trong Python.',
  },
  // ... rest of mock data
]

export async function getQuizzes(): Promise<Quiz[]> {
  try {
    // const result = await queryDatabase('SELECT * FROM quizzes')
    // return result.rows.map(row => ({ ... }))

    logger.info("Fetching quizzes from mock data")
    return mockQuizzes
  } catch (error) {
    logger.error("Failed to fetch quizzes", { error: String(error) })
    return mockQuizzes // Fallback to mock data
  }
}

export async function getQuizById(id: string): Promise<Quiz | undefined> {
  try {
    const quizzes = await getQuizzes()
    return quizzes.find((q) => q.id === id)
  } catch (error) {
    logger.error("Failed to fetch quiz", { id, error: String(error) })
    return undefined
  }
}

export async function getQuestionsByQuizId(quizId: string): Promise<Question[]> {
  try {
    // const result = await queryDatabase('SELECT * FROM questions WHERE quiz_id = $1', [quizId])
    logger.info("Fetching questions", { quizId })
    return mockQuestions.filter((q) => q.quizId === quizId)
  } catch (error) {
    logger.error("Failed to fetch questions", { quizId, error: String(error) })
    return []
  }
}

export async function getQuestionById(id: string): Promise<Question | undefined> {
  try {
    const allQuestions = mockQuestions // Should fetch from DB
    return allQuestions.find((q) => q.id === id)
  } catch (error) {
    logger.error("Failed to fetch question", { id, error: String(error) })
    return undefined
  }
}

export async function submitAnswers(quizId: string, answers: Answer[]): Promise<SubmitResult> {
  try {
    const quizQuestions = await getQuestionsByQuizId(quizId)
    let correctCount = 0
    const details: SubmitResult["details"] = []

    for (const answer of answers) {
      const question = await getQuestionById(answer.questionId)
      if (!question) continue

      const expected = question.answer.sort((a, b) => a - b)
      const selected = answer.selected.sort((a, b) => a - b)

      const isCorrect = selected.length === expected.length && selected.every((v, i) => v === expected[i])

      if (isCorrect) correctCount++

      details.push({
        questionId: answer.questionId,
        correct: isCorrect,
        correctOptions: question.answer,
        explanation: question.explanation,
      })
    }

    const scorePercent = Math.round((correctCount / answers.length) * 100)

    // await queryDatabase('INSERT INTO user_sessions (...) VALUES (...)', [...])
    logger.info("Quiz submitted", { quizId, scorePercent, correctCount, total: answers.length })

    return {
      scorePercent,
      correctCount,
      total: answers.length,
      details,
    }
  } catch (error) {
    logger.error("Failed to submit answers", { quizId, error: String(error) })
    throw error
  }
}
