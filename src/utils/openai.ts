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
  const trimmed = apiKey.trim()
  // OpenAI API keys typically start with 'sk-' and are at least 51 characters long
  return trimmed.length >= 51 && (trimmed.startsWith('sk-') || trimmed.startsWith('sk-proj-'))
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
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du bist ein hilfreicher Assistent, der präzise und verständliche Erklärungen auf Deutsch gibt.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.3
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

  } catch (error: any) {
    console.error('OpenAI API Error:', error)

    // Handle OpenAI SDK specific errors
    if (error?.status) {
      switch (error.status) {
        case 401:
          return {
            success: false,
            error: 'Ungültiger API-Schlüssel. Bitte überprüfen Sie Ihren OpenAI API-Schlüssel.'
          }
        case 429:
          return {
            success: false,
            error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.'
          }
        case 403:
          return {
            success: false,
            error: 'API-Kontingent erschöpft oder Zugriff verweigert. Bitte überprüfen Sie Ihr OpenAI-Konto.'
          }
        case 404:
          return {
            success: false,
            error: 'Das angegebene Modell ist nicht verfügbar. Bitte überprüfen Sie die Modellverfügbarkeit.'
          }
        case 500:
        case 502:
        case 503:
          return {
            success: false,
            error: 'OpenAI-Server temporär nicht verfügbar. Bitte versuchen Sie es später erneut.'
          }
        default:
          return {
            success: false,
            error: `OpenAI API Fehler (${error.status}): ${error.message || 'Unbekannter Fehler'}`
          }
      }
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: `Fehler: ${error.message}`
      }
    }

    return {
      success: false,
      error: 'Unbekannter Fehler bei der OpenAI-Anfrage'
    }
  }
}

export async function testApiConnection(apiKey: string): Promise<ApiResponse<string>> {
  try {
    if (!validateApiKey(apiKey)) {
      return {
        success: false,
        error: 'Ungültiges API-Schlüssel Format. OpenAI-Schlüssel beginnen mit "sk-" oder "sk-proj-" und sind mindestens 51 Zeichen lang.'
      }
    }

    const client = initializeClient(apiKey)

    console.log('Testing OpenAI API connection...')
    const startTime = Date.now()

    const response = await client.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du bist ein hilfreicher Assistent. Antworte kurz und präzise auf Deutsch.'
        },
        {
          role: 'user',
          content: 'Sage "API-Verbindung erfolgreich getestet" und nenne das aktuelle Modell.'
        }
      ],
      max_tokens: 50,
      temperature: 0
    })

    const endTime = Date.now()
    const responseTime = endTime - startTime

    const testMessage = response.choices[0]?.message?.content
    if (!testMessage) {
      throw new Error('Keine Antwort von OpenAI erhalten')
    }

    const modelUsed = response.model || 'Unbekannt'
    const tokensUsed = response.usage?.total_tokens || 0

    return {
      success: true,
      data: `✅ API-Test erfolgreich!\n\n📄 Antwort: ${testMessage}\n🤖 Modell: ${modelUsed}\n⚡ Antwortzeit: ${responseTime}ms\n🔢 Tokens verbraucht: ${tokensUsed}`
    }

  } catch (error: any) {
    console.error('API Connection test failed:', error)

    // Handle OpenAI SDK specific errors
    if (error?.status) {
      switch (error.status) {
        case 401:
          return {
            success: false,
            error: '❌ Ungültiger API-Schlüssel\n\nBitte überprüfen Sie:\n• API-Schlüssel korrekt eingegeben\n• Schlüssel ist noch gültig\n• Konto ist aktiv'
          }
        case 403:
          return {
            success: false,
            error: '🚫 Zugriff verweigert\n\nMögliche Ursachen:\n• API-Kontingent erschöpft\n• Modell nicht verfügbar\n• Konto-Einschränkungen'
          }
        case 429:
          return {
            success: false,
            error: '⏳ Zu viele Anfragen\n\nBitte warten Sie einen Moment und versuchen Sie es erneut.'
          }
        case 404:
          return {
            success: false,
            error: '🔍 Modell nicht gefunden\n\nDas angegebene Modell ist nicht verfügbar. Versuchen Sie "gpt-4o-mini" oder "gpt-4o".'
          }
        case 500:
        case 502:
        case 503:
          return {
            success: false,
            error: '🔧 OpenAI-Server Problem\n\nDie OpenAI-Server sind temporär nicht verfügbar. Versuchen Sie es später erneut.'
          }
        default:
          return {
            success: false,
            error: `❌ API-Fehler (${error.status})\n\n${error.message || 'Unbekannter Fehler'}`
          }
      }
    }

    return {
      success: false,
      error: `❌ Verbindungsfehler\n\n${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
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

    const response = await client.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond briefly in German.'
        },
        {
          role: 'user',
          content: 'Sage nur "API Test erfolgreich" auf Deutsch.'
        }
      ],
      max_tokens: 10,
      temperature: 0
    })

    const testMessage = response.choices[0]?.message?.content
    if (!testMessage) {
      throw new Error('Keine Antwort von OpenAI erhalten')
    }

    return {
      success: true,
      data: true
    }

  } catch (error: any) {
    console.error('API Key test failed:', error)

    // Handle OpenAI SDK specific errors
    if (error?.status) {
      switch (error.status) {
        case 401:
          return {
            success: false,
            error: 'Ungültiger API-Schlüssel'
          }
        case 403:
          return {
            success: false,
            error: 'API-Zugriff verweigert oder Kontingent erschöpft'
          }
        case 429:
          return {
            success: false,
            error: 'Zu viele Anfragen'
          }
        default:
          return {
            success: false,
            error: `API-Test fehlgeschlagen (${error.status})`
          }
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'API-Schlüssel Test fehlgeschlagen'
    }
  }
}