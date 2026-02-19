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
    example1: {
      story: parsed?.example1?.story || '',
      topicTag: parsed?.example1?.topicTag || '',
      moodTag: parsed?.example1?.moodTag || '',
      usedExpressionVariants: parsed?.example1?.usedExpressionVariants || [],
    },
    example2: {
      story: parsed?.example2?.story || '',
      topicTag: parsed?.example2?.topicTag || '',
      moodTag: parsed?.example2?.moodTag || '',
      usedExpressionVariants: parsed?.example2?.usedExpressionVariants || [],
    },
    example3: {
      story: parsed?.example3?.story || '',
      topicTag: parsed?.example3?.topicTag || '',
      moodTag: parsed?.example3?.moodTag || '',
      usedExpressionVariants: parsed?.example3?.usedExpressionVariants || [],
    },
    review1: {
      story: parsed?.review1?.story || '',
      topicTag: parsed?.review1?.topicTag || '',
      moodTag: parsed?.review1?.moodTag || '',
      usedExpressionVariants: parsed?.review1?.usedExpressionVariants || [],
    },
    review2: {
      story: parsed?.review2?.story || '',
      topicTag: parsed?.review2?.topicTag || '',
      moodTag: parsed?.review2?.moodTag || '',
      usedExpressionVariants: parsed?.review2?.usedExpressionVariants || [],
    },
    review3: {
      story: parsed?.review3?.story || '',
      topicTag: parsed?.review3?.topicTag || '',
      moodTag: parsed?.review3?.moodTag || '',
      usedExpressionVariants: parsed?.review3?.usedExpressionVariants || [],
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
  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
}

async function generateBundle(params) {
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const slots = buildDiversitySlots();
      const parsed = await requestJsonFromGemini(buildBundlePrompt(params, slots));
      const bundle = toLearningBundle(parsed, params);
      const result = validateLearningBundle(bundle);
      if (result.valid) return bundle;
      lastError = new Error(`bundle_validation_failed:${result.reason}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`Learning bundle generation failed: ${String(lastError)}`);
}

async function resolveAndGenerate(input) {
  const slots = buildDiversitySlots();
  const parsed = await requestJsonFromGemini(buildResolveAndGeneratePrompt(input, slots));
  const status = String(parsed?.status || '').trim();

  if (status === 'invalid') {
    return {
      status: 'invalid',
      reasonKo: String(parsed?.reasonKo || '존재하지 않거나 학습용 표현이 아닙니다.'),
      retryHintKo: String(parsed?.retryHintKo || '다른 단어/구문으로 다시 시도해 주세요.'),
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
      normalizedInput: String(parsed?.normalizedInput || input).trim() || input,
      candidates,
    };
  }

  if (status === 'ready') {
    const selectedPhrase = String(parsed?.selected?.phrase || '').trim();
    const selectedSenseLabelKo = String(parsed?.selected?.senseLabelKo || '').trim();
    const selectedDomain = normalizeDomain(String(parsed?.selected?.domain || 'general'));

    if (!selectedPhrase || !selectedSenseLabelKo) {
      return {
        status: 'invalid',
        reasonKo: '표현 의미를 확정하지 못했습니다.',
        retryHintKo: '다시 시도해 주세요.',
      };
    }

    const bundle = toLearningBundle(parsed?.bundle || {}, {
      expression: input,
      phrase: selectedPhrase,
      senseLabelKo: selectedSenseLabelKo,
      domain: selectedDomain,
    });

    const validation = validateLearningBundle(bundle);
    if (!validation.valid) {
      return {
        status: 'needs_selection',
        normalizedInput: input,
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

module.exports = {
  generateBundle,
  resolveAndGenerate,
};
