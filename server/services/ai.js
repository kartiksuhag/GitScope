import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Call Gemini via the official SDK with a system prompt + user content.
 * @param {string} systemPrompt - The agent's system instruction
 * @param {string} content      - The code / question to analyze
 * @param {string} model        - Gemini model name (default: gemini-2.0-flash)
 * @returns {Promise<string>}   - AI text response
 */
export async function callGemini(systemPrompt, content, model = 'gemini-3.5-flash') {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in .env');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const genModel = genAI.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
  });

  const result = await genModel.generateContent(content);
  return result.response.text();
}

/**
 * Fallback: call local Ollama (if Gemini is unavailable)
 * Requires Ollama running on localhost:11434 with a model pulled.
 * @param {string} systemPrompt
 * @param {string} content
 * @param {string} model - e.g. "llama3" or "codellama"
 */
export async function callOllama(systemPrompt, content, model = 'llama3') {
  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: `${systemPrompt}\n\n${content}`,
      stream: false,
    }),
  });

  if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
  const data = await res.json();
  return data.response;
}

/**
 * Legacy REST shim — kept for backwards compatibility with roast.js
 */
export async function askGemini(systemPrompt, userPrompt) {
  return callGemini(systemPrompt, userPrompt);
}
