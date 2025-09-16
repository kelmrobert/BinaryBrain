import OpenAI from 'openai'
import type { ApiResponse } from '@/types'

let openaiClient: OpenAI | null = null

function initializeClient(apiKey: string): OpenAI {
  if (!openaiClient || openaiClient.apiKey !== apiKey) {
    openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    })
  }
  return openaiClient
}

function validateApiKey(apiKey: string): boolean {
  return apiKey.trim().length > 0 && apiKey.startsWith('sk-')
}

export async function getExplanation(
  question: string,
  correctAnswer: boolean,
  apiKey: string
): Promise<ApiResponse<string>> {
  try {
    if (!validateApiKey(apiKey)) {
      return {
        success: false,
        error: 'Ungültiger OpenAI API-Schlüssel'
      }
    }

    const client = initializeClient(apiKey)

    const prompt = `Erkläre, warum die folgende Aussage ${correctAnswer ? 'RICHTIG' : 'FALSCH'} ist:

Frage: ${question}
Korrekte Antwort: ${correctAnswer ? 'Richtig' : 'Falsch'}

Bitte gib eine ausführliche, verständliche Erklärung auf Deutsch.`

    const response = await client.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7
    })

    const explanation = response.choices[0]?.message?.content

    if (!explanation) {
      return {
        success: false,
        error: 'Keine Erklärung von OpenAI erhalten'
      }
    }

    return {
      success: true,
      data: explanation
    }

  } catch (error) {
    console.error('OpenAI API Error:', error)

    if (error instanceof Error) {
      // Handle specific OpenAI errors
      if (error.message.includes('401')) {
        return {
          success: false,
          error: 'Ungültiger API-Schlüssel. Bitte überprüfen Sie Ihren OpenAI API-Schlüssel.'
        }
      }

      if (error.message.includes('429')) {
        return {
          success: false,
          error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.'
        }
      }

      if (error.message.includes('quota')) {
        return {
          success: false,
          error: 'API-Kontingent erschöpft. Bitte überprüfen Sie Ihr OpenAI-Konto.'
        }
      }

      return {
        success: false,
        error: `OpenAI Fehler: ${error.message}`
      }
    }

    return {
      success: false,
      error: 'Unbekannter Fehler bei der OpenAI-Anfrage'
    }
  }
}

export async function testApiKey(apiKey: string): Promise<ApiResponse<boolean>> {
  try {
    if (!validateApiKey(apiKey)) {
      return {
        success: false,
        error: 'Ungültiger API-Schlüssel Format'
      }
    }

    const client = initializeClient(apiKey)

    await client.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Test' }],
      max_tokens: 5
    })

    return {
      success: true,
      data: true
    }

  } catch (error) {
    console.error('API Key test failed:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'API-Schlüssel Test fehlgeschlagen'
    }
  }
}