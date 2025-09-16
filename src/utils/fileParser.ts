import * as XLSX from 'xlsx'
import type { Question, FileUploadResult, AnswerFormat } from '@/types'

const ANSWER_FORMATS: Record<string, boolean> = {
  // true/false format
  'true': true,
  'false': false,
  'TRUE': true,
  'FALSE': false,
  'True': true,
  'False': false,

  // 1/0 format
  '1': true,
  '0': false,

  // German ja/nein format
  'ja': true,
  'nein': false,
  'Ja': true,
  'Nein': false,
  'JA': true,
  'NEIN': false,

  // German richtig/falsch format
  'richtig': true,
  'falsch': false,
  'Richtig': true,
  'Falsch': false,
  'RICHTIG': true,
  'FALSCH': false
}

function detectAnswerFormat(answers: string[]): AnswerFormat {
  const sampleAnswers = answers.slice(0, 10).map(a => a.trim())

  if (sampleAnswers.every(a => ['true', 'false', 'TRUE', 'FALSE', 'True', 'False'].includes(a))) {
    return 'true/false'
  }

  if (sampleAnswers.every(a => ['1', '0'].includes(a))) {
    return '1/0'
  }

  if (sampleAnswers.every(a => ['ja', 'nein', 'Ja', 'Nein', 'JA', 'NEIN'].includes(a))) {
    return 'ja/nein'
  }

  if (sampleAnswers.every(a => ['richtig', 'falsch', 'Richtig', 'Falsch', 'RICHTIG', 'FALSCH'].includes(a))) {
    return 'richtig/falsch'
  }

  return 'true/false'
}

function normalizeAnswer(answer: string): boolean | null {
  const trimmed = answer.trim()
  if (trimmed in ANSWER_FORMATS) {
    return ANSWER_FORMATS[trimmed]
  }
  return null
}

function validateFileSize(file: File): string[] {
  const errors: string[] = []
  const maxSize = parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760') // 10MB default

  if (file.size > maxSize) {
    errors.push(`Datei ist zu groß. Maximum: ${Math.round(maxSize / 1024 / 1024)}MB`)
  }

  return errors
}

function validateFileType(file: File): string[] {
  const errors: string[] = []
  const allowedTypes = [
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]

  const allowedExtensions = ['.csv', '.xls', '.xlsx']
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))

  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    errors.push('Dateityp nicht unterstützt. Erlaubt: CSV, XLS, XLSX')
  }

  return errors
}

async function parseCSV(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        const data = lines.map(line => {
          // Simple CSV parsing - handles basic cases
          const cells = []
          let current = ''
          let inQuotes = false

          for (let i = 0; i < line.length; i++) {
            const char = line[i]

            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
              cells.push(current.trim())
              current = ''
            } else {
              current += char
            }
          }

          cells.push(current.trim())
          return cells.map(cell => cell.replace(/^"|"$/g, ''))
        })

        resolve(data)
      } catch (error) {
        reject(new Error(`CSV-Parsing-Fehler: ${error}`))
      }
    }

    reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'))
    reader.readAsText(file, 'UTF-8')
  })
}

async function parseExcel(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        // Take the first worksheet
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          reject(new Error('Keine Arbeitsblätter in der Excel-Datei gefunden'))
          return
        }

        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          raw: false
        }) as string[][]

        // Filter out empty rows
        const filteredData = jsonData.filter(row =>
          row.some(cell => cell && cell.toString().trim())
        )

        resolve(filteredData)
      } catch (error) {
        reject(new Error(`Excel-Parsing-Fehler: ${error}`))
      }
    }

    reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'))
    reader.readAsArrayBuffer(file)
  })
}

export async function parseQuestionFile(file: File): Promise<FileUploadResult> {
  const errors: string[] = []

  // Validate file
  errors.push(...validateFileSize(file))
  errors.push(...validateFileType(file))

  if (errors.length > 0) {
    return { success: false, questions: [], errors }
  }

  try {
    let data: string[][]

    // Parse file based on type
    if (file.type === 'text/csv' || file.type === 'application/csv' || file.name.toLowerCase().endsWith('.csv')) {
      data = await parseCSV(file)
    } else {
      data = await parseExcel(file)
    }

    if (data.length === 0) {
      return {
        success: false,
        questions: [],
        errors: ['Datei ist leer oder enthält keine gültigen Daten']
      }
    }

    // Validate structure
    const firstRow = data[0]
    if (firstRow.length < 2) {
      return {
        success: false,
        questions: [],
        errors: ['Datei muss mindestens 2 Spalten haben (Frage, Antwort)']
      }
    }

    // Process questions
    const questions: Question[] = []
    const invalidRows: number[] = []
    const answerColumn = firstRow.length >= 2 ? 1 : 0

    // Extract answers to detect format
    const answers = data.slice(0).map(row => row[answerColumn] || '').filter(Boolean)
    const format = detectAnswerFormat(answers)

    data.forEach((row, index) => {
      if (row.length < 2) {
        invalidRows.push(index + 1)
        return
      }

      const questionText = row[0]?.trim()
      const answerText = row[answerColumn]?.trim()

      if (!questionText || !answerText) {
        invalidRows.push(index + 1)
        return
      }

      const correctAnswer = normalizeAnswer(answerText)
      if (correctAnswer === null) {
        invalidRows.push(index + 1)
        return
      }

      questions.push({
        id: `question-${index}`,
        text: questionText,
        correctAnswer: correctAnswer
      })
    })

    if (invalidRows.length > 0) {
      errors.push(`Ungültige Zeilen: ${invalidRows.join(', ')}`)
    }

    if (questions.length === 0) {
      return {
        success: false,
        questions: [],
        errors: [...errors, 'Keine gültigen Fragen gefunden']
      }
    }

    return {
      success: true,
      questions,
      errors: errors.length > 0 ? errors : undefined,
      format
    }

  } catch (error) {
    return {
      success: false,
      questions: [],
      errors: [error instanceof Error ? error.message : 'Unbekannter Fehler beim Parsen der Datei']
    }
  }
}