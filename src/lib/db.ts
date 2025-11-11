// Mock database - In production, use SQLite, PostgreSQL, or Supabase
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

const quizzes: Quiz[] = [
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

const questions: Question[] = [
  {
    id: "q1",
    quizId: "python_keywords_expert",
    question: "Từ khóa nào dùng để định nghĩa một hàm trong Python?",
    options: ["function", "def", "lambda", "define"],
    answer: [1],
    type: "singleSelect",
    explanation: 'Từ khóa "def" được sử dụng để định nghĩa một hàm trong Python.',
  },
  {
    id: "q2",
    quizId: "python_keywords_expert",
    question: "Từ khóa nào dùng để tạo một hàm bất động bộ?",
    options: ["async", "await", "def", "thread"],
    answer: [0],
    type: "singleSelect",
    explanation: 'Từ khóa "async" được sử dụng để định nghĩa một hàm bất động bộ trong Python.',
  },
  {
    id: "q3",
    quizId: "python_keywords_expert",
    question: 'Từ khóa "yield" thường được dùng trong loại hàm nào?',
    options: ["Hàm bình thường", "Generator", "Hàm lambda", "Async function"],
    answer: [1],
    type: "singleSelect",
    explanation: '"yield" được sử dụng trong các hàm generator để trả về các giá trị một lần một.',
  },
  {
    id: "q4",
    quizId: "python_keywords_expert",
    question: "Cách nào để tạo một hàm với số lượng đối số không xác định?",
    options: ["*args", "**kwargs", "Cả hai *args và **kwargs", "Không thể làm được"],
    answer: [0, 1],
    type: "multiSelect",
    explanation: "Cả *args và **kwargs đều có thể được sử dụng để tạo hàm với số lượng đối số không xác định.",
  },
  {
    id: "q5",
    quizId: "python_keywords_expert",
    question: "Từ khóa nào dùng để xử lý ngoại lệ trong Python?",
    options: ["try-catch", "try-except", "error-handle", "handle-error"],
    answer: [1],
    type: "singleSelect",
    explanation: 'Từ khóa "try-except" được sử dụng để xử lý ngoại lệ trong Python.',
  },
  {
    id: "q6",
    quizId: "python_basics",
    question: "Cách nào để tạo một danh sách trong Python?",
    options: ["{}", "[]", "()", "list()"],
    answer: [1, 3],
    type: "multiSelect",
    explanation: "Cả [] và list() đều có thể được sử dụng để tạo một danh sách trong Python.",
  },
  {
    id: "q7",
    quizId: "python_basics",
    question: "Hàm nào được sử dụng để lấy độ dài của một danh sách?",
    options: ["size()", "length()", "len()", "count()"],
    answer: [2],
    type: "singleSelect",
    explanation: "Hàm len() được sử dụng để lấy độ dài của một danh sách trong Python.",
  },
  {
    id: "q8",
    quizId: "python_basics",
    question: "Loại dữ liệu nào trong Python không thay đổi được?",
    options: ["List", "Dictionary", "Tuple", "Set"],
    answer: [2],
    type: "singleSelect",
    explanation: "Tuple là loại dữ liệu không thay đổi được (immutable) trong Python.",
  },
  {
    id: "q9",
    quizId: "python_basics",
    question: "Từ khóa nào được sử dụng để lặp qua các phần tử trong một danh sách?",
    options: ["while", "for", "foreach", "loop"],
    answer: [1],
    type: "singleSelect",
    explanation: 'Từ khóa "for" được sử dụng để lặp qua các phần tử trong một danh sách.',
  },
  {
    id: "q10",
    quizId: "python_basics",
    question: "Hàm nào được sử dụng để chuyển đổi một chuỗi thành một số?",
    options: ["str()", "int()", "float()", "num()"],
    answer: [1, 2],
    type: "multiSelect",
    explanation: "Cả int() và float() được sử dụng để chuyển đổi một chuỗi thành một số.",
  },
]

export function getQuizzes(): Quiz[] {
  return quizzes
}

export function getQuizById(id: string): Quiz | undefined {
  return quizzes.find((q) => q.id === id)
}

export function getQuestionsByQuizId(quizId: string): Question[] {
  return questions.filter((q) => q.quizId === quizId)
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id)
}

export interface Answer {
  questionId: string
  selected: number[]
}

export interface SubmitResult {
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

export function submitAnswers(quizId: string, answers: Answer[]): SubmitResult {
  const quizQuestions = getQuestionsByQuizId(quizId)
  let correctCount = 0
  const details: SubmitResult["details"] = []

  answers.forEach((answer) => {
    const question = getQuestionById(answer.questionId)
    if (!question) return

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
  })

  const scorePercent = Math.round((correctCount / answers.length) * 100)

  return {
    scorePercent,
    correctCount,
    total: answers.length,
    details,
  }
}
