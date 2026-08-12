import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Lead Intelligence Analyzer
 * Priority Pipeline:
 * 1. n8n Webhook Orchestration Engine (triggers Sheets/Discord + AI)
 * 2. Direct Gemini AI Model Analysis
 * 3. Keyword Heuristic Fallback Engine
 */
export const analyzeLead = async (leadData) => {
  const { name, email, company, notes } = leadData;

  // 1. Try n8n Webhook Orchestration
  if (process.env.N8N_WEBHOOK_URL) {
    try {
      const n8nResponse = await axios.post(
        process.env.N8N_WEBHOOK_URL,
        { name, email, company, notes },
        { timeout: 5000 }
      );

      if (n8nResponse.data && typeof n8nResponse.data.score === 'number') {
        return {
          score: Math.min(100, Math.max(0, n8nResponse.data.score)),
          summary: n8nResponse.data.summary || 'Processed via n8n automated workflow.',
          source: 'n8n-webhook',
        };
      }
    } catch (err) {
      console.warn('n8n Webhook unreachable. Falling back to Gemini Direct:', err.message);
    }
  }

  // 2. Fallback to Direct Gemini AI API
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a sales intelligence system. Analyze this lead:
      Name: ${name}
      Company: ${company || 'N/A'}
      Notes: ${notes || 'N/A'}

      Return ONLY a raw JSON object (no markdown formatting, no code fences) with:
      "score": integer between 0 and 100,
      "summary": 1-2 sentence justification.`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text().trim();
      const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      if (typeof parsed.score === 'number') {
        return {
          score: Math.min(100, Math.max(0, parsed.score)),
          summary: parsed.summary || 'Analyzed via Gemini AI engine.',
          source: 'gemini-direct',
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed. Falling back to Heuristic Engine:', err.message);
    }
  }

  // 3. Fallback to Rule-Based Keyword Heuristics
  let score = 50;
  const context = `${company || ''} ${notes || ''}`.toLowerCase();

  const highIntentKeywords = ['budget', 'enterprise', 'urgent', 'decision maker', 'pricing', 'demo', 'immediate'];
  const lowIntentKeywords = ['student', 'test', 'fake', 'spam', 'curious'];

  highIntentKeywords.forEach((kw) => {
    if (context.includes(kw)) score += 10;
  });

  lowIntentKeywords.forEach((kw) => {
    if (context.includes(kw)) score -= 15;
  });

  return {
    score: Math.min(100, Math.max(0, score)),
    summary: 'Scored via fallback keyword heuristic rule engine.',
    source: 'heuristic-fallback',
  };
};