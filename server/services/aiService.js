import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Strict Zod schema for AI/Automation output
const LeadAnalysisSchema = z.object({
  score: z.number().int().min(0).max(100),
  summary: z.string().min(3),
});

/**
 * Lead Intelligence Analyzer
 * Pipeline Hierarchy:
 * 1. n8n Automation Webhook (executes Sheets/Discord side-effects)
 * 2. Direct Gemini AI API (with Zod schema validation)
 * 3. Deterministic Heuristic Fallback Engine
 */
export const analyzeLead = async (leadData) => {
  const { name, email, company, notes } = leadData;

  // 1. Attempt n8n Webhook Pipeline
  if (process.env.N8N_WEBHOOK_URL) {
    try {
      const n8nResponse = await axios.post(
        process.env.N8N_WEBHOOK_URL,
        { name, email, company, notes },
        { timeout: 5000 }
      );

      const parsed = LeadAnalysisSchema.safeParse(n8nResponse.data);
      if (parsed.success) {
        return {
          score: parsed.data.score,
          summary: parsed.data.summary,
          source: 'n8n-webhook',
        };
      }
      console.warn('n8n response failed schema validation:', parsed.error.format());
    } catch (err) {
      console.warn('n8n Webhook unreachable. Proceeding to Direct Gemini:', err.message);
    }
  }

  // 2. Attempt Direct Gemini API
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a sales intelligence system. Evaluate this prospect:
Name: ${name}
Company: ${company || 'N/A'}
Notes: ${notes || 'N/A'}

Respond ONLY with a valid, raw JSON object matching this schema:
{
  "score": <integer from 0 to 100>,
  "summary": "<1-2 sentence justification>"
}`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text().trim();
      const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

      const parsedJson = JSON.parse(cleanedJson);
      const validated = LeadAnalysisSchema.safeParse(parsedJson);

      if (validated.success) {
        return {
          score: validated.data.score,
          summary: validated.data.summary,
          source: 'gemini-direct',
        };
      }
      console.warn('Gemini response failed Zod schema check:', validated.error.format());
    } catch (err) {
      console.warn('Gemini call/parse failed. Degrading to heuristic engine:', err.message);
    }
  }

  // 3. Fallback Heuristic Rule Engine
  let score = 50;
  const context = `${company || ''} ${notes || ''}`.toLowerCase();

  const highIntentKeywords = ['budget', 'enterprise', 'urgent', 'decision maker', 'pricing', 'demo', 'immediate', 'contract'];
  const lowIntentKeywords = ['student', 'test', 'fake', 'spam', 'curious', 'academic'];

  highIntentKeywords.forEach((kw) => {
    if (context.includes(kw)) score += 10;
  });

  lowIntentKeywords.forEach((kw) => {
    if (context.includes(kw)) score -= 15;
  });

  return {
    score: Math.min(100, Math.max(0, score)),
    summary: 'Prospect scored via deterministic keyword heuristic rule engine.',
    source: 'heuristic-fallback',
  };
};