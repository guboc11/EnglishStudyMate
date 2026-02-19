import { buildDiversitySlots } from '@/services/diversity';
import { validateLearningBundle } from '@/services/validateBundle';
import type { LearningBundle, LearningPageKey } from '@/types/learning';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const PAGE_KEYS: LearningPageKey[] = [
  'example1',
  'example2',
  'example3',
  'review1',
  'review2',
  'review3',
];

const BASE_FALLBACK_STORY = `A rainy afternoon, I saw a small cat outside and decided to take it in.
I gave it warm food and a dry towel, and it slowly relaxed near the window.
The next day, the cat followed me around the house like we had known each other for a long time.
That simple moment helped me understand what it means to take something in with care.`;

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
    throw new Error('Gemini output does not contain valid JSON object');
  }

  return trimmed.slice(first, last + 1);
}

function buildPrompt(expression: string): string {
  const slots = buildDiversitySlots();
  const slotLines = PAGE_KEYS.map((key) => {
    const slot = slots[key];
    return `${key}: topic=${slot.topic}; mood=${slot.mood}; setting=${slot.setting}`;
  }).join('\n');

  return `
You are creating learning stories for the English expression "${expression}".

Output only valid JSON with this exact shape:
{
  "expression": "string",
  "example1": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
  "example2": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
  "example3": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
  "review1": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
  "review2": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
  "review3": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
  "meaning": {
    "literalMeaningKo":"string",
    "realUsageKo":"string",
    "etymologyKo":"string",
    "nuanceKo":"string",
    "shortExampleEn":"string",
    "shortExampleKo":"string"
  }
}

Hard rules:
1) Every story must be 3 to 4 sentences, easy A2-B1 English.
2) Every story must naturally include the target expression or its grammatical variation.
3) Each page must use a clearly different context and situation from the others.
4) Keep the meaning anchored to the same target expression across all pages.
5) No title, no markdown, no explanation, JSON only.
6) "meaning" fields must be Korean-centered explanations (except shortExampleEn).
7) shortExampleEn must include the target expression or its natural variation.
8) Each meaning field should be concise (1 to 2 sentences).

Use these page slots for diversity:
${slotLines}
`.trim();
}

function toLearningBundle(parsed: any, expression: string): LearningBundle {
  return {
    expression,
    example1: {
      story: parsed?.example1?.story ?? '',
      topicTag: parsed?.example1?.topicTag ?? '',
      moodTag: parsed?.example1?.moodTag ?? '',
      usedExpressionVariants: parsed?.example1?.usedExpressionVariants ?? [],
    },
    example2: {
      story: parsed?.example2?.story ?? '',
      topicTag: parsed?.example2?.topicTag ?? '',
      moodTag: parsed?.example2?.moodTag ?? '',
      usedExpressionVariants: parsed?.example2?.usedExpressionVariants ?? [],
    },
    example3: {
      story: parsed?.example3?.story ?? '',
      topicTag: parsed?.example3?.topicTag ?? '',
      moodTag: parsed?.example3?.moodTag ?? '',
      usedExpressionVariants: parsed?.example3?.usedExpressionVariants ?? [],
    },
    review1: {
      story: parsed?.review1?.story ?? '',
      topicTag: parsed?.review1?.topicTag ?? '',
      moodTag: parsed?.review1?.moodTag ?? '',
      usedExpressionVariants: parsed?.review1?.usedExpressionVariants ?? [],
    },
    review2: {
      story: parsed?.review2?.story ?? '',
      topicTag: parsed?.review2?.topicTag ?? '',
      moodTag: parsed?.review2?.moodTag ?? '',
      usedExpressionVariants: parsed?.review2?.usedExpressionVariants ?? [],
    },
    review3: {
      story: parsed?.review3?.story ?? '',
      topicTag: parsed?.review3?.topicTag ?? '',
      moodTag: parsed?.review3?.moodTag ?? '',
      usedExpressionVariants: parsed?.review3?.usedExpressionVariants ?? [],
    },
    meaning: {
      literalMeaningKo: parsed?.meaning?.literalMeaningKo ?? '',
      realUsageKo: parsed?.meaning?.realUsageKo ?? '',
      etymologyKo: parsed?.meaning?.etymologyKo ?? '',
      nuanceKo: parsed?.meaning?.nuanceKo ?? '',
      shortExampleEn: parsed?.meaning?.shortExampleEn ?? '',
      shortExampleKo: parsed?.meaning?.shortExampleKo ?? '',
    },
  };
}

async function requestBundleFromGemini(expression: string): Promise<LearningBundle> {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY');
  }

  const prompt = buildPrompt(expression);
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
        temperature: 0.95,
        topP: 0.95,
        maxOutputTokens: 1800,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const raw = extractGeneratedText(payload);
  if (!raw) throw new Error('Gemini API returned empty content');

  const parsed = JSON.parse(extractJsonText(raw));
  return toLearningBundle(parsed, expression);
}

export function buildFallbackLearningBundle(expression: string): LearningBundle {
  return {
    expression,
    example1: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_home',
      moodTag: 'warm',
      usedExpressionVariants: [expression],
    },
    example2: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_street',
      moodTag: 'calm',
      usedExpressionVariants: [expression],
    },
    example3: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_social',
      moodTag: 'reflective',
      usedExpressionVariants: [expression],
    },
    review1: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_review1',
      moodTag: 'calm',
      usedExpressionVariants: [expression],
    },
    review2: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_review2',
      moodTag: 'encouraging',
      usedExpressionVariants: [expression],
    },
    review3: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_review3',
      moodTag: 'warm',
      usedExpressionVariants: [expression],
    },
    meaning: {
      literalMeaningKo: `"${expression}"는 문맥 안으로 받아들이거나 이해한다는 뜻으로 자주 쓰입니다.`,
      realUsageKo:
        '실제 대화에서는 정보, 사람, 감정, 변화 등을 받아들이는 상황에서 자연스럽게 사용됩니다.',
      etymologyKo:
        '기본적으로 안으로 들이다라는 이미지에서 출발해, 물리적 수용과 추상적 이해 의미로 확장되었습니다.',
      nuanceKo:
        '단순히 본다보다 더 적극적으로 받아들여 이해하거나 수용하는 느낌이 있습니다.',
      shortExampleEn: `I needed time to ${expression} what she said.`,
      shortExampleKo: '그녀가 한 말을 이해해서 받아들이는 데 시간이 필요했다.',
    },
  };
}

export async function generateLearningBundle(expression: string): Promise<LearningBundle> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const bundle = await requestBundleFromGemini(expression);
      const result = validateLearningBundle(bundle, expression);
      if (result.valid) return bundle;
      lastError = new Error(`bundle_validation_failed:${result.reason}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`Learning bundle generation failed: ${String(lastError)}`);
}
