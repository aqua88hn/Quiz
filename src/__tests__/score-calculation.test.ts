import { submitAnswers, type Answer } from "@/lib/datalayer/db-quiz-question"

describe("Score Calculation", () => {
  it("should calculate 100% for all correct single-select answers", () => {
    const answers: Answer[] = [
      { questionId: "q1", selected: [1] }, // def - correct
      { questionId: "q2", selected: [0] }, // async - correct
    ]

    const result = submitAnswers("python_keywords_expert", answers)

    expect(result.scorePercent).toBe(100)
    expect(result.correctCount).toBe(2)
    expect(result.total).toBe(2)
  })

  it("should calculate 50% for partially correct answers", () => {
    const answers: Answer[] = [
      { questionId: "q1", selected: [1] }, // def - correct
      { questionId: "q2", selected: [1] }, // await - incorrect (should be async)
    ]

    const result = submitAnswers("python_keywords_expert", answers)

    expect(result.scorePercent).toBe(50)
    expect(result.correctCount).toBe(1)
    expect(result.total).toBe(2)
  })

  it("should include correct options in details", () => {
    const answers: Answer[] = [
      { questionId: "q1", selected: [2] }, // lambda - incorrect
    ]

    const result = submitAnswers("python_keywords_expert", answers)

    expect(result.details[0]).toHaveProperty("correctOptions")
    expect(result.details[0]).toHaveProperty("explanation")
    expect(result.details[0].correct).toBe(false)
  })

  it("should return 0% for all incorrect answers", () => {
    const answers: Answer[] = [
      { questionId: "q1", selected: [0] }, // function - incorrect
      { questionId: "q2", selected: [2] }, // def - incorrect
    ]

    const result = submitAnswers("python_keywords_expert", answers)

    expect(result.scorePercent).toBe(0)
    expect(result.correctCount).toBe(0)
  })
})
