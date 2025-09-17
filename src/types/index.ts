export interface Question {
  id: string
  text: string
  correctAnswer: boolean
  explanation?: string
}

export interface UserAnswer {
  questionId: string
  userAnswer: boolean
  isCorrect: boolean
  timestamp: Date
}

export interface QuizStatistics {
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  accuracy: number
  timeSpent: number
}

export interface QuizState {
  questions: Question[]
  currentQuestionIndex: number
  answers: UserAnswer[]
  isQuizActive: boolean
  isQuizCompleted: boolean
  statistics: QuizStatistics
}

export interface SettingsState {
  openaiApiKey: string
  soundEnabled: boolean
  theme: 'light' | 'dark'
  keyboardNavigation: boolean
}

export type AnswerFormat = 'true/false' | '1/0' | 'ja/nein' | 'richtig/falsch' | 'restored'

export interface FileUploadResult {
  success: boolean
  questions: Question[]
  errors?: string[]
  format?: AnswerFormat
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PersistedFile {
  id: string
  originalName: string
  storedPath: string
  uploadedAt: Date
  size: number
  type: string
}

export interface PersistedQuizData {
  file: PersistedFile
  questions: Question[]
  quizState?: {
    currentQuestionIndex: number
    answers: UserAnswer[]
    isQuizActive: boolean
    isQuizCompleted: boolean
    startTime: Date | null
    endTime: Date | null
  }
  lastModified: Date
}