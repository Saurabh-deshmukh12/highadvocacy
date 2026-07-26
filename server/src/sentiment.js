// Sentiment analysis — uses OpenRouter if API key is set, otherwise falls back to keyword analysis

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY

async function analyzeWithAI(text) {
  if (!OPENROUTER_KEY) return null

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'http://localhost:3099',
      },
      body: JSON.stringify({
        model: 'google/gemma-2-9b-it:free',
        messages: [
          { role: 'system', content: 'Classify the sentiment of this testimonial. Reply with exactly ONE word: positive, negative, or neutral.' },
          { role: 'user', content: text },
        ],
        max_tokens: 10,
        temperature: 0,
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    const result = data.choices?.[0]?.message?.content?.trim().toLowerCase()
    if (['positive', 'negative', 'neutral'].includes(result)) return result
    return null
  } catch {
    return null
  }
}

function analyzeWithKeywords(text) {
  const lower = text.toLowerCase()

  const positiveWords = [
    'amazing', 'excellent', 'great', 'love', 'awesome', 'fantastic',
    'wonderful', 'outstanding', 'best', 'perfect', 'transformed',
    'impressed', 'recommend', 'helpful', 'brilliant', 'incredible',
    'superb', 'exceptional', 'delighted', 'happy', 'pleased',
  ]
  const negativeWords = [
    'terrible', 'awful', 'horrible', 'bad', 'worst', 'poor',
    'disappointed', 'frustrated', 'waste', 'broken', 'useless',
    'never', 'avoid', 'hate', 'disgusting', 'pathetic', 'junk',
    'scam', 'rip-off', 'regret', 'garbage',
  ]

  let positive = 0
  let negative = 0

  for (const word of positiveWords) {
    if (lower.includes(word)) positive++
  }
  for (const word of negativeWords) {
    if (lower.includes(word)) negative++
  }

  if (positive > negative) return 'positive'
  if (negative > positive) return 'negative'
  return 'neutral'
}

export async function analyzeSentiment(text) {
  // Try AI first if key is available
  const aiResult = await analyzeWithAI(text)
  if (aiResult) return aiResult

  // Fallback to keyword analysis
  return analyzeWithKeywords(text)
}
