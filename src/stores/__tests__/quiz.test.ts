import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useQuizStore } from '../quiz'
import type { Question } from '../../types'

describe('Quiz Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockQuestions: Question[] = [
    { id: '1', text: 'Question 1', correctAnswer: true },
    { id: '2', text: 'Question 2', correctAnswer: false },
    { id: '3', text: 'Question 3', correctAnswer: true }
  ]

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useQuizStore()

      expect(store.questions).toEqual([])
      expect(store.currentQuestionIndex).toBe(0)
      expect(store.answers).toEqual([])
      expect(store.isQuizActive).toBe(false)
      expect(store.isQuizCompleted).toBe(false)
    })
  })

  describe('loadQuestions', () => {
    it('should load questions and reset quiz state', () => {
      const store = useQuizStore()

      store.loadQuestions(mockQuestions)

      expect(store.questions).toEqual(mockQuestions)
      expect(store.totalQuestions).toBe(3)
      expect(store.currentQuestionIndex).toBe(0)
      expect(store.isQuizActive).toBe(false)
      expect(store.isQuizCompleted).toBe(false)
    })

    it('should assign IDs to questions without IDs', () => {
      const store = useQuizStore()
      const questionsWithoutIds = [
        { id: '', text: 'Question 1', correctAnswer: true },
        { id: '', text: 'Question 2', correctAnswer: false }
      ]

      store.loadQuestions(questionsWithoutIds)

      expect(store.questions[0].id).toBe('question-0')
      expect(store.questions[1].id).toBe('question-1')
    })
  })

  describe('startQuiz', () => {
    it('should start quiz when questions are loaded', () => {
      const store = useQuizStore()
      store.loadQuestions(mockQuestions)

      const result = store.startQuiz()

      expect(result).toBe(true)
      expect(store.isQuizActive).toBe(true)
      expect(store.isQuizCompleted).toBe(false)
      expect(store.currentQuestionIndex).toBe(0)
      expect(store.answers).toEqual([])
    })

    it('should not start quiz when no questions are loaded', () => {
      const store = useQuizStore()

      const result = store.startQuiz()

      expect(result).toBe(false)
      expect(store.isQuizActive).toBe(false)
    })
  })

  describe('answerQuestion', () => {
    it('should record correct answer', () => {
      const store = useQuizStore()
      store.loadQuestions(mockQuestions)
      store.startQuiz()

      const result = store.answerQuestion(true) // Correct answer for question 1

      expect(result).toBe(true)
      expect(store.answers).toHaveLength(1)
      expect(store.answers[0].questionId).toBe('1')
      expect(store.answers[0].userAnswer).toBe(true)
      expect(store.answers[0].isCorrect).toBe(true)
    })

    it('should record incorrect answer', () => {
      const store = useQuizStore()
      store.loadQuestions(mockQuestions)
      store.startQuiz()

      const result = store.answerQuestion(false) // Incorrect answer for question 1

      expect(result).toBe(false)
      expect(store.answers[0].isCorrect).toBe(false)
    })

    it('should update existing answer for same question', () => {
      const store = useQuizStore()
      store.loadQuestions(mockQuestions)
      store.startQuiz()

      store.answerQuestion(false) // First answer
      store.answerQuestion(true)  // Updated answer

      expect(store.answers).toHaveLength(1) // Only one answer per question
      expect(store.answers[0].userAnswer).toBe(true)
      expect(store.answers[0].isCorrect).toBe(true)
    })

    it('should not answer when quiz is not active', () => {
      const store = useQuizStore()
      store.loadQuestions(mockQuestions)

      const result = store.answerQuestion(true)

      expect(result).toBe(false)
      expect(store.answers).toHaveLength(0)
    })
  })

  describe('navigation', () => {
    it('should navigate to next question', () => {
      const store = useQuizStore()
      store.loadQuestions(mockQuestions)
      store.startQuiz()

      const result = store.nextQuestion()

      expect(result).toBe(true)
      expect(store.currentQuestionIndex).toBe(1)
    })

    it('should navigate to previous question', () => {
      const store = useQuizStore()
      store.loadQuestions(mockQuestions)
      store.startQuiz()
      store.nextQuestion() // Go to question 2

      const result = store.previousQuestion()

      expect(result).toBe(true)
      expect(store.currentQuestionIndex).toBe(0)
    })

    it('should complete quiz when moving past last question', () => {
      const store = useQuizStore()
      store.loadQuestions(mockQuestions)
      store.startQuiz()
      store.currentQuestionIndex = 2 // Last question

      const result = store.nextQuestion()

      expect(result).toBe(false)
      expect(store.isQuizCompleted).toBe(true)
      expect(store.isQuizActive).toBe(false)
    })

    it('should not go before first question', () => {
      const store = useQuizStore()
      store.loadQuestions(mockQuestions)
      store.startQuiz()

      const result = store.previousQuestion()

      expect(result).toBe(false)
      expect(store.currentQuestionIndex).toBe(0)
    })
  })

  describe('computed properties', () => {
    it('should calculate statistics correctly', () => {
      const store = useQuizStore()
      store.loadQuestions(mockQuestions)
      store.startQuiz()

      store.answerQuestion(true)  // Correct
      store.nextQuestion()
      store.answerQuestion(true)  // Incorrect (answer should be false)
      store.nextQuestion()
      store.answerQuestion(true)  // Correct

      expect(store.correctAnswers).toBe(2)
      expect(store.wrongAnswers).toBe(1)
      expect(Math.round(store.accuracy * 100) / 100).toBe(66.67) // 66.67%
    })

    it('should identify current question', () => {
      const store = useQuizStore()
      store.loadQuestions(mockQuestions)

      expect(store.currentQuestion).toEqual(mockQuestions[0])

      store.currentQuestionIndex = 1
      expect(store.currentQuestion).toEqual(mockQuestions[1])
    })

    it('should calculate progress correctly', () => {
      const store = useQuizStore()
      store.loadQuestions(mockQuestions)

      expect(Math.round(store.progress * 100) / 100).toBe(33.33) // 33.33% (question 1 of 3)

      store.currentQuestionIndex = 1
      expect(Math.round(store.progress * 100) / 100).toBe(66.67) // 66.67% (question 2 of 3)
    })
  })

  describe('resetQuiz', () => {
    it('should reset quiz state', () => {
      const store = useQuizStore()
      store.loadQuestions(mockQuestions)
      store.startQuiz()
      store.answerQuestion(true)
      store.nextQuestion()

      store.resetQuiz()

      expect(store.currentQuestionIndex).toBe(0)
      expect(store.answers).toEqual([])
      expect(store.isQuizActive).toBe(false)
      expect(store.isQuizCompleted).toBe(false)
    })
  })

  describe('clearQuestions', () => {
    it('should clear all questions and reset state', () => {
      const store = useQuizStore()
      store.loadQuestions(mockQuestions)
      store.startQuiz()

      store.clearQuestions()

      expect(store.questions).toEqual([])
      expect(store.totalQuestions).toBe(0)
      expect(store.currentQuestionIndex).toBe(0)
      expect(store.isQuizActive).toBe(false)
    })
  })
})