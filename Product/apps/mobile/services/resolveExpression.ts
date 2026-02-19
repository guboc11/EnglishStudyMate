import type { ExpressionResolution, SenseCandidate } from '@/types/selection';

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

function extractJsonText(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;

  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) {
    throw new Error('Resolver output does not contain valid JSON object');
  }

  return trimmed.slice(first, last + 1);
}

function normalizeDomain(domain: string): SenseCandidate['domains'][number] {
  const value = domain.trim().toLowerCase();
  if (value === 'tech') return 'tech';
  if (value === 'art') return 'art';
  if (value === 'business') return 'business';
  if (value === 'science') return 'science';
  if (value === 'daily') return 'daily';
  return 'general';
}

function sanitizeCandidates(raw: any[]): SenseCandidate[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => ({
      id: String(item.id ?? `sense_${index + 1}`),
      phrase: String(item.phrase ?? '').trim(),
      senseLabelKo: String(item.senseLabelKo ?? '').trim(),
      shortHintKo: String(item.shortHintKo ?? '').trim(),
      domains: Array.isArray(item.domains)
        ? item.domains.map((domain: string) => normalizeDomain(String(domain)))
        : ['general'],
    }))
    .filter((item) => item.phrase && item.senseLabelKo)
    .slice(0, 6);
}

function buildPrompt(input: string): string {
  return `
You classify the learner input "${input}".

Return JSON only in one of these exact shapes:
1) Invalid:
{
  "status":"invalid",
  "reasonKo":"string",
  "retryHintKo":"string"
}

2) Valid:
{
  "status":"valid",
  "normalizedInput":"string",
  "candidates":[
    {
      "id":"string",
      "phrase":"string",
      "senseLabelKo":"string",
      "shortHintKo":"string",
      "domains":["general"|"tech"|"art"|"business"|"science"|"daily"]
    }
  ]
}

Rules:
- If the input is nonsense/non-existent/not a practical learning expression, return invalid.
- If valid, return 1 to 6 candidates.
- Candidates may include phrasal variants (e.g., take in, take off) when appropriate.
- Keep Korean labels concise and clear.
- No markdown, no explanation, JSON only.
`.trim();
}

export async function resolveExpression(input: string): Promise<ExpressionResolution> {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY');
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: buildPrompt(input) }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: 900,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resolve API error (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const raw = extractGeneratedText(payload);
  if (!raw) {
    throw new Error('Resolve API returned empty content');
  }

  const parsed = JSON.parse(extractJsonText(raw));
  if (parsed?.status === 'invalid') {
    return {
      status: 'invalid',
      reasonKo: String(parsed?.reasonKo ?? '존재하지 않거나 학습용 표현이 아닙니다.'),
      retryHintKo: String(parsed?.retryHintKo ?? '다른 단어/구문으로 다시 시도해 주세요.'),
    };
  }

  const candidates = sanitizeCandidates(parsed?.candidates);
  if (candidates.length === 0) {
    return {
      status: 'invalid',
      reasonKo: '의미를 판별할 수 없는 입력입니다.',
      retryHintKo: '학습하려는 단어/구문을 다시 입력해 주세요.',
    };
  }

  return {
    status: 'valid',
    normalizedInput: String(parsed?.normalizedInput ?? input).trim() || input,
    candidates,
  };
}
