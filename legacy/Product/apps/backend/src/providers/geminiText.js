const { buildDiversitySlots } = require('../lib/diversity');
const { validateLearningBundle } = require('../lib/validateBundle');
const {
  buildBundlePrompt,
  buildResolveAndGeneratePrompt,
} = require('../lib/prompts');
const {
  extractGeneratedText,
  extractJsonText,
  normalizeDomain,
  sanitizeCandidates,
} = require('../lib/shared');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function getEndpoint() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
  return {
    apiKey,
    endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
  };
}

function toLearningBundle(parsed, params) {
  return {
    expression: params.phrase,
    step1: {
      sentence: parsed?.step1?.sentence || '',
    },
    step2: {
      story: parsed?.step2?.story || '',
      topicTag: parsed?.step2?.topicTag || '',
      moodTag: parsed?.step2?.moodTag || '',
    },
    step3: {
      story: parsed?.step3?.story || '',
      topicTag: parsed?.step3?.topicTag || '',
      moodTag: parsed?.step3?.moodTag || '',
    },
    meaning: {
      literalMeaningKo: parsed?.meaning?.literalMeaningKo || '',
      realUsageKo: parsed?.meaning?.realUsageKo || '',
      etymologyKo: parsed?.meaning?.etymologyKo || '',
      nuanceKo: parsed?.meaning?.nuanceKo || '',
      shortExampleEn: parsed?.meaning?.shortExampleEn || '',
      shortExampleKo: parsed?.meaning?.shortExampleKo || '',
    },
    selectionMeta: {
      selectedPhrase: params.phrase,
      selectedSenseLabelKo: params.senseLabelKo,
      selectedDomain: params.domain,
    },
  };
}

async function requestJsonFromGemini(prompt) {
  const { endpoint, apiKey } = getEndpoint();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Gemini API timeout (30s)');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// TODO: Gemini 연동 활성화 전까지 하드코딩 스텁
async function generateBundle(params) {
  const phrase = params.phrase || 'stub expression';
  return {
    expression: phrase,
    step1: {
      sentence: `This is a stub sentence for "${phrase}".`,
    },
    step2: {
      story: `[STUB] Short story using "${phrase}". Character A tried to use it. It worked.`,
      topicTag: 'daily',
      moodTag: 'neutral',
    },
    step3: {
      story: `[STUB] Longer story using "${phrase}". Character A and B had a conversation. They used the expression naturally. Everyone understood.`,
      topicTag: 'daily',
      moodTag: 'neutral',
    },
    meaning: {
      literalMeaningKo: `[STUB] "${phrase}"의 직역`,
      realUsageKo: `[STUB] 실제 용법`,
      etymologyKo: '[STUB] 어원',
      nuanceKo: '[STUB] 뉘앙스',
      shortExampleEn: `Use "${phrase}" in context.`,
      shortExampleKo: `"${phrase}"을 문맥에서 사용.`,
    },
    selectionMeta: {
      selectedPhrase: phrase,
      selectedSenseLabelKo: params.senseLabelKo || '[STUB] 의미',
      selectedDomain: params.domain || 'general',
    },
  };
}

// TODO: Gemini 연동 활성화 전까지 하드코딩 스텁
async function resolveAndGenerate(input) {
  const phrase = input;
  const bundle = await generateBundle({
    phrase,
    senseLabelKo: '[STUB] 의미',
    domain: 'general',
  });
  return {
    status: 'ready',
    expression: phrase,
    bundle,
  };
}

module.exports = {
  generateBundle,
  resolveAndGenerate,
};
