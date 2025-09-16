import { describe, it, expect } from 'vitest'
import { parseQuestionFile } from '../fileParser'

describe('fileParser', () => {
  describe('parseQuestionFile', () => {
    it('should validate file size', async () => {
      const oversizedFile = new File(['x'.repeat(11 * 1024 * 1024)], 'test.csv', {
        type: 'text/csv'
      })

      const result = await parseQuestionFile(oversizedFile)

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Datei ist zu groß. Maximum: 10MB')
    })

    it('should validate file type', async () => {
      const invalidFile = new File(['test'], 'test.txt', {
        type: 'text/plain'
      })

      const result = await parseQuestionFile(invalidFile)

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Dateityp nicht unterstützt. Erlaubt: CSV, XLS, XLSX')
    })

    it('should parse valid CSV with true/false format', async () => {
      const csvContent = `Frage 1,true
Frage 2,false
Frage 3,true`

      const file = new File([csvContent], 'test.csv', {
        type: 'text/csv'
      })

      const result = await parseQuestionFile(file)

      expect(result.success).toBe(true)
      expect(result.questions).toHaveLength(3)
      expect(result.questions[0].text).toBe('Frage 1')
      expect(result.questions[0].correctAnswer).toBe(true)
      expect(result.questions[1].correctAnswer).toBe(false)
      expect(result.format).toBe('true/false')
    })

    it('should parse valid CSV with 1/0 format', async () => {
      const csvContent = `Was ist 2+2=4?,1
Ist die Erde flach?,0`

      const file = new File([csvContent], 'test.csv', {
        type: 'text/csv'
      })

      const result = await parseQuestionFile(file)

      expect(result.success).toBe(true)
      expect(result.questions).toHaveLength(2)
      expect(result.questions[0].correctAnswer).toBe(true)
      expect(result.questions[1].correctAnswer).toBe(false)
      expect(result.format).toBe('1/0')
    })

    it('should parse valid CSV with German ja/nein format', async () => {
      const csvContent = `Ist Berlin die Hauptstadt von Deutschland?,ja
Ist München die Hauptstadt von Deutschland?,nein`

      const file = new File([csvContent], 'test.csv', {
        type: 'text/csv'
      })

      const result = await parseQuestionFile(file)

      expect(result.success).toBe(true)
      expect(result.questions).toHaveLength(2)
      expect(result.questions[0].correctAnswer).toBe(true)
      expect(result.questions[1].correctAnswer).toBe(false)
      expect(result.format).toBe('ja/nein')
    })

    it('should handle empty file', async () => {
      const file = new File([''], 'test.csv', {
        type: 'text/csv'
      })

      const result = await parseQuestionFile(file)

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Datei ist leer oder enthält keine gültigen Daten')
    })

    it('should handle invalid structure', async () => {
      const csvContent = `Nur eine Spalte`

      const file = new File([csvContent], 'test.csv', {
        type: 'text/csv'
      })

      const result = await parseQuestionFile(file)

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Datei muss mindestens 2 Spalten haben (Frage, Antwort)')
    })

    it('should handle mixed valid and invalid rows', async () => {
      const csvContent = `Frage 1,true
,false
Frage 3,invalid
Frage 4,false`

      const file = new File([csvContent], 'test.csv', {
        type: 'text/csv'
      })

      const result = await parseQuestionFile(file)

      expect(result.success).toBe(true)
      expect(result.questions).toHaveLength(2) // Only valid rows
      expect(result.errors).toContain('Ungültige Zeilen: 2, 3')
    })

    it('should handle CSV with quoted fields', async () => {
      const csvContent = `"Frage mit, Komma",true
"Frage ""mit"" Anführungszeichen",false`

      const file = new File([csvContent], 'test.csv', {
        type: 'text/csv'
      })

      const result = await parseQuestionFile(file)

      expect(result.success).toBe(true)
      expect(result.questions).toHaveLength(2)
      expect(result.questions[0].text).toBe('Frage mit, Komma')
      expect(result.questions[1].text).toBe('Frage mit Anführungszeichen')
    })
  })
})