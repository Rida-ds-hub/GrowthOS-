import { GoogleGenerativeAI } from '@google/generative-ai'

const geminiApiKey = process.env.GEMINI_API_KEY || ''

if (!geminiApiKey) {
  console.warn('Gemini API key not configured. Using placeholder.')
}

export const genAI = new GoogleGenerativeAI(geminiApiKey || 'placeholder-key')

// Use gemini-2.5-flash model
export const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
