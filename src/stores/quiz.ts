import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Question, UserAnswer, QuizStatistics } from '@/types'

export const useQuizStore = defineStore('quiz', () => {
  // State
  const questions = ref<Question[]>([])
  const currentQuestionIndex = ref(0)
  const answers = ref<UserAnswer[]>([])
  const isQuizActive = ref(false)
  const isQuizCompleted = ref(false)
  const startTime = ref<Date | null>(null)
  const endTime = ref<Date | null>(null)

  // Getters
  const currentQuestion = computed(() =>
    questions.value[currentQuestionIndex.value] || null
  )

  const totalQuestions = computed(() => questions.value.length)

  const correctAnswers = computed(() =>
    answers.value.filter(answer => answer.isCorrect).length
  )

  const wrongAnswers = computed(() =>
    answers.value.filter(answer => !answer.isCorrect).length
  )

  const accuracy = computed(() =>
    totalQuestions.value > 0 ? (correctAnswers.value / totalQuestions.value) * 100 : 0
  )

  const timeSpent = computed(() => {
    if (!startTime.value || !endTime.value) return 0
    return Math.floor((endTime.value.getTime() - startTime.value.getTime()) / 1000)
  })

  const statistics = computed<QuizStatistics>(() => ({
    totalQuestions: totalQuestions.value,
    correctAnswers: correctAnswers.value,
    wrongAnswers: wrongAnswers.value,
    accuracy: accuracy.value,
    timeSpent: timeSpent.value
  }))

  const hasNextQuestion = computed(() =>
    currentQuestionIndex.value < questions.value.length - 1
  )

  const hasPreviousQuestion = computed(() => currentQuestionIndex.value > 0)

  const progress = computed(() =>
    totalQuestions.value > 0 ? ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100 : 0
  )

  // Actions
  function loadQuestions(newQuestions: Question[]) {
    questions.value = newQuestions.map((q, index) => ({
      ...q,
      id: q.id || `question-${index}`
    }))
    resetQuiz()
  }

  function startQuiz() {
    if (questions.value.length === 0) return false

    isQuizActive.value = true
    isQuizCompleted.value = false
    currentQuestionIndex.value = 0
    answers.value = []
    startTime.value = new Date()
    endTime.value = null

    return true
  }

  function answerQuestion(answer: boolean) {
    const question = currentQuestion.value
    if (!question || !isQuizActive.value) return false

    const userAnswer: UserAnswer = {
      questionId: question.id,
      userAnswer: answer,
      isCorrect: answer === question.correctAnswer,
      timestamp: new Date()
    }

    // Update or add answer
    const existingIndex = answers.value.findIndex(a => a.questionId === question.id)
    if (existingIndex >= 0) {
      answers.value[existingIndex] = userAnswer
    } else {
      answers.value.push(userAnswer)
    }

    return userAnswer.isCorrect
  }

  function nextQuestion() {
    if (hasNextQuestion.value) {
      currentQuestionIndex.value++
      return true
    } else {
      completeQuiz()
      return false
    }
  }

  function previousQuestion() {
    if (hasPreviousQuestion.value) {
      currentQuestionIndex.value--
      return true
    }
    return false
  }

  function goToQuestion(index: number) {
    if (index >= 0 && index < questions.value.length) {
      currentQuestionIndex.value = index
      return true
    }
    return false
  }

  function completeQuiz() {
    isQuizActive.value = false
    isQuizCompleted.value = true
    endTime.value = new Date()
  }

  function resetQuiz() {
    currentQuestionIndex.value = 0
    answers.value = []
    isQuizActive.value = false
    isQuizCompleted.value = false
    startTime.value = null
    endTime.value = null
  }

  function clearQuestions() {
    questions.value = []
    resetQuiz()
  }

  function getAnswerForQuestion(questionId: string) {
    return answers.value.find(answer => answer.questionId === questionId)
  }

  function isQuestionAnswered(questionId: string) {
    return answers.value.some(answer => answer.questionId === questionId)
  }

  return {
    // State
    questions,
    currentQuestionIndex,
    answers,
    isQuizActive,
    isQuizCompleted,

    // Getters
    currentQuestion,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    accuracy,
    timeSpent,
    statistics,
    hasNextQuestion,
    hasPreviousQuestion,
    progress,

    // Actions
    loadQuestions,
    startQuiz,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    completeQuiz,
    resetQuiz,
    clearQuestions,
    getAnswerForQuestion,
    isQuestionAnswered
  }
})