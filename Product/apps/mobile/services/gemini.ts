import { buildDiversitySlots } from '@/services/diversity';
import { validateLearningBundle } from '@/services/validateBundle';
import type { LearningBundle, LearningPageKey } from '@/types/learning';
import type {
  DomainTag,
  ResolveAndGenerateResult,
  SenseCandidate,
} from '@/types/selection';

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

function getStoryPreview(story: string): string {
  const normalized = String(story ?? '').replace(/\s+/g, ' ').trim();
  return normalized.length <= 220 ? normalized : `${normalized.slice(0, 220)}...`;
}

function parseValidationReason(reason: string): {
  baseReason: string;
  pageKey?: LearningPageKey;
} {
  for (const pageKey of PAGE_KEYS) {
    const suffix = `_${pageKey}`;
    if (reason.endsWith(suffix)) {
      return {
        baseReason: reason.slice(0, -suffix.length),
        pageKey,
      };
    }
  }

  return { baseReason: reason };
}

const BASE_FALLBACK_STORY = `A rainy afternoon, I saw a small cat outside and decided to take it in.
I gave it warm food and a dry towel, and it slowly relaxed near the window.
The next day, the cat followed me around the house like we had known each other for a long time.
That simple moment helped me understand what it means to take something in with care.`;

export type GenerateBundleParams = {
  expression: string;
  phrase: string;
  senseLabelKo: string;
  domain: DomainTag;
};

export type ResolveAndGenerateParams = {
  input: string;
};

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

function normalizeDomain(domain: string): DomainTag {
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

function buildBundlePrompt(params: GenerateBundleParams): string {
  const slots = buildDiversitySlots();
  const slotLines = PAGE_KEYS.map((key) => {
    const slot = slots[key];
    return `${key}: topic=${slot.topic}; mood=${slot.mood}; setting=${slot.setting}`;
  }).join('\n');

  return `
You are creating learning stories for an English expression.

Selected phrase: "${params.phrase}"
Selected sense (Korean): "${params.senseLabelKo}"
Selected domain: "${params.domain}"

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
2) Every story must naturally include the selected phrase or its grammatical variation.
3) Each page must use a clearly different context and situation from the others.
4) Keep all stories anchored to the selected sense and domain.
4-1) If additional context is provided, reflect it naturally in story situations.
5) No title, no markdown, no explanation, JSON only.
6) "meaning" fields must be Korean-centered explanations (except shortExampleEn).
7) shortExampleEn must include the selected phrase or its natural variation.
8) Each meaning field should be concise (1 to 2 sentences).

Use these page slots for diversity:
${slotLines}
`.trim();
}

function buildResolveAndGeneratePrompt(params: ResolveAndGenerateParams): string {
  const slots = buildDiversitySlots();
  const slotLines = PAGE_KEYS.map((key) => {
    const slot = slots[key];
    return `${key}: topic=${slot.topic}; mood=${slot.mood}; setting=${slot.setting}`;
  }).join('\n');

  return `
You analyze learner input and decide whether to generate learning content immediately.

Input expression: "${params.input}"

Output JSON only in one of these shapes:

1) invalid
{
  "status":"invalid",
  "reasonKo":"string",
  "retryHintKo":"string"
}

2) needs_selection
{
  "status":"needs_selection",
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

3) ready
{
  "status":"ready",
  "selected":{
    "phrase":"string",
    "senseLabelKo":"string",
    "domain":"general|tech|art|business|science|daily"
  },
  "bundle": {
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
}

Rules:
- If input is nonsense/non-existent/not practical, return invalid.
- If sense is ambiguous, return needs_selection with 1-6 candidates.
- If context clearly disambiguates, return ready.
- In ready, bundle must follow the same quality rules:
  - each story 3-4 sentences
  - selected phrase variation included naturally
  - contexts diverse across pages
  - selected sense/domain must stay consistent
  - meaning fields Korean-centered except shortExampleEn
- No markdown, no explanation, JSON only.

Use these page slots for diversity in ready mode:
${slotLines}
`.trim();
}

function toLearningBundle(parsed: any, params: GenerateBundleParams): LearningBundle {
  return {
    expression: params.phrase,
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
    selectionMeta: {
      selectedPhrase: params.phrase,
      selectedSenseLabelKo: params.senseLabelKo,
      selectedDomain: params.domain,
    },
  };
}

async function requestJsonFromGemini(prompt: string): Promise<any> {
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
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.95,
        topP: 0.95,
        maxOutputTokens: 2000,
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

  return JSON.parse(extractJsonText(raw));
}

async function requestBundleFromGemini(params: GenerateBundleParams): Promise<LearningBundle> {
  const parsed = await requestJsonFromGemini(buildBundlePrompt(params));
  return toLearningBundle(parsed, params);
}

export async function resolveAndGenerateLearning(
  params: ResolveAndGenerateParams
): Promise<ResolveAndGenerateResult> {
  const parsed = await requestJsonFromGemini(buildResolveAndGeneratePrompt(params));
  const status = String(parsed?.status ?? '').trim();

  if (status === 'invalid') {
    return {
      status: 'invalid',
      reasonKo: String(parsed?.reasonKo ?? '존재하지 않거나 학습용 표현이 아닙니다.'),
      retryHintKo: String(parsed?.retryHintKo ?? '다른 단어/구문으로 다시 시도해 주세요.'),
    };
  }

  if (status === 'needs_selection') {
    const candidates = sanitizeCandidates(parsed?.candidates);
    if (candidates.length === 0) {
      return {
        status: 'invalid',
        reasonKo: '의미를 판별할 수 없는 입력입니다.',
        retryHintKo: '학습하려는 단어/구문을 다시 입력해 주세요.',
      };
    }

    return {
      status: 'needs_selection',
      normalizedInput: String(parsed?.normalizedInput ?? params.input).trim() || params.input,
      candidates,
    };
  }

  if (status === 'ready') {
    const selectedPhrase = String(parsed?.selected?.phrase ?? '').trim();
    const selectedSenseLabelKo = String(parsed?.selected?.senseLabelKo ?? '').trim();
    const selectedDomain = normalizeDomain(String(parsed?.selected?.domain ?? 'general'));

    if (!selectedPhrase || !selectedSenseLabelKo) {
      return {
        status: 'invalid',
        reasonKo: '표현 의미를 확정하지 못했습니다.',
        retryHintKo: '다시 시도해 주세요.',
      };
    }

    const bundle = toLearningBundle(parsed?.bundle ?? {}, {
      expression: params.input,
      phrase: selectedPhrase,
      senseLabelKo: selectedSenseLabelKo,
      domain: selectedDomain,
    });

    const validation = validateLearningBundle(bundle, selectedPhrase);
    if (!validation.valid) {
      return {
        status: 'needs_selection',
        normalizedInput: params.input,
        candidates: [
          {
            id: 'fallback_selected',
            phrase: selectedPhrase,
            senseLabelKo: selectedSenseLabelKo,
            shortHintKo: '자동 확정 결과를 검토해 주세요.',
            domains: [selectedDomain],
          },
        ],
      };
    }

    return {
      status: 'ready',
      expression: selectedPhrase,
      bundle,
    };
  }

  return {
    status: 'invalid',
    reasonKo: '의미를 판별할 수 없는 입력입니다.',
    retryHintKo: '학습하려는 단어/구문을 다시 입력해 주세요.',
  };
}

export function buildFallbackLearningBundle(params: GenerateBundleParams): LearningBundle {
  return {
    expression: params.phrase,
    example1: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_home',
      moodTag: 'warm',
      usedExpressionVariants: [params.phrase],
    },
    example2: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_street',
      moodTag: 'calm',
      usedExpressionVariants: [params.phrase],
    },
    example3: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_social',
      moodTag: 'reflective',
      usedExpressionVariants: [params.phrase],
    },
    review1: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_review1',
      moodTag: 'calm',
      usedExpressionVariants: [params.phrase],
    },
    review2: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_review2',
      moodTag: 'encouraging',
      usedExpressionVariants: [params.phrase],
    },
    review3: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_review3',
      moodTag: 'warm',
      usedExpressionVariants: [params.phrase],
    },
    meaning: {
      literalMeaningKo: `"${params.phrase}"는 문맥 안으로 받아들이거나 이해한다는 뜻으로 자주 쓰입니다.`,
      realUsageKo:
        '실제 대화에서는 정보, 사람, 감정, 변화를 받아들이는 상황에서 자연스럽게 사용됩니다.',
      etymologyKo:
        '기본적으로 안으로 들이다라는 이미지에서 출발해, 물리적 수용과 추상적 이해 의미로 확장되었습니다.',
      nuanceKo:
        '단순히 본다보다 더 적극적으로 받아들여 이해하거나 수용하는 느낌이 있습니다.',
      shortExampleEn: `I needed time to ${params.phrase} what she said.`,
      shortExampleKo: '그녀가 한 말을 이해해서 받아들이는 데 시간이 필요했다.',
    },
    selectionMeta: {
      selectedPhrase: params.phrase,
      selectedSenseLabelKo: params.senseLabelKo,
      selectedDomain: params.domain,
    },
  };
}

export async function generateLearningBundle(params: GenerateBundleParams): Promise<LearningBundle> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    console.info(
      `[generateLearningBundle] attempt=${attempt}/3 phrase="${params.phrase}" sense="${params.senseLabelKo}" domain="${params.domain}"`
    );

    try {
      const bundle = await requestBundleFromGemini(params);
      const result = validateLearningBundle(bundle, params.phrase);
      if (result.valid) {
        console.info(
          `[generateLearningBundle] validation passed attempt=${attempt} phrase="${params.phrase}"`
        );
        return bundle;
      }

      const { baseReason, pageKey } = parseValidationReason(result.reason);
      const pageStory = pageKey ? bundle[pageKey]?.story ?? '' : '';

      console.warn(
        `[generateLearningBundle] validation failed attempt=${attempt} reason="${result.reason}" baseReason="${baseReason}" page="${pageKey ?? 'n/a'}" phrase="${params.phrase}"`
      );
      if (pageKey) {
        console.warn(
          `[generateLearningBundle] failed_page_story_preview page="${pageKey}" preview="${getStoryPreview(pageStory)}"`
        );
      }

      lastError = new Error(`bundle_validation_failed:${result.reason}`);
    } catch (error) {
      console.error(
        `[generateLearningBundle] request failed attempt=${attempt} phrase="${params.phrase}"`,
        error
      );
      lastError = error;
    }
  }

  throw new Error(`Learning bundle generation failed: ${String(lastError)}`);
}
