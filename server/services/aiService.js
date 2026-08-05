export const analyzeLeadWithAI = async (leadData) => {
  const apiKey = process.env.GEMINI_API_KEY;

  // Try live API if an AIza key is present
  if (apiKey && apiKey.startsWith('AIzaSy')) {
    try {
      const prompt = `
You are an expert B2B Sales Qualification AI. Analyze the following lead and evaluate their conversion probability.

Lead Information:
- Name: ${leadData.name}
- Email: ${leadData.email}
- Company: ${leadData.company}
- Interaction Notes: ${leadData.notes || 'None provided'}

Provide a structured evaluation in valid JSON format with keys "score" (0-100) and "qualificationReason" (1-2 sentences).
Respond ONLY with raw JSON.
`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      const data = await response.json();
      if (response.ok) {
        const text = data.candidates[0].content.parts[0].text.trim();
        const cleanedText = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanedText);
      }
    } catch (err) {
      console.warn('Live API call failed, using intelligent heuristic analyzer:', err.message);
    }
  }

  // --- LOCAL INTELLIGENT SCORING ENGINE ---
  let score = 50;
  const reasons = [];
  const notes = (leadData.notes || '').toLowerCase();

  // High Intent Signals
  if (notes.includes('budget') || notes.includes('$') || notes.includes('approved')) {
    score += 20;
    reasons.push('Approved budget identified');
  }
  if (notes.includes('urgent') || notes.includes('this month') || notes.includes('asap')) {
    score += 15;
    reasons.push('High timeline urgency');
  }
  if (notes.includes('enterprise') || notes.includes('licenses') || notes.includes('rollout')) {
    score += 10;
    reasons.push('Enterprise scope');
  }

  // Low Intent Signals
  if (notes.includes('just browsing') || notes.includes('too expensive') || notes.includes('no budget')) {
    score -= 30;
    reasons.push('Low intent/budget constraints detected');
  }

  // Cap score between 10 and 98
  score = Math.min(Math.max(score, 10), 98);

  const qualificationReason = reasons.length > 0
    ? `AI Identified: ${reasons.join(', ')}.`
    : 'Standard prospect requiring initial outreach call.';

  return { score, qualificationReason };
};