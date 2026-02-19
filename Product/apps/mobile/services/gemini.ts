const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function extractGeneratedText(payload: any): string | null {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;

  const text = parts
    .map((part: { text?: string }) => part?.text ?? '')
    .join('\n')
    .trim();

  return text.length > 0 ? text : null;
}

export async function generateExample1Story(expression: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY');
  }

  const prompt = [
    `Create a short story that helps the learner understand the expression "${expression}".`,
    'Write 3 to 4 sentences.',
    'Use very simple English that even a young child can understand.',
    'Make the context rich, intuitive, and easy to imagine.',
    'Include clear situation details so the meaning of the expression is naturally understood.',
    'The output must be one connected story, not separate examples.',
    'Do not add a title, bullets, or explanations.',
  ].join(' ');

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 220,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const generated = extractGeneratedText(payload);
  if (!generated) {
    throw new Error('Gemini API returned empty content');
  }

  return generated;
}
