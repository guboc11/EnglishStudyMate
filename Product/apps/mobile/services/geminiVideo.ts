const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const VEO_MODEL = process.env.EXPO_PUBLIC_VEO_MODEL ?? 'veo-3.1-generate-preview';
const VEO_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_MS = 180000;

type VideoOperation = {
  name?: string;
  done?: boolean;
  response?: any;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function extractVideoUri(operation: VideoOperation): string | null {
  const response = operation?.response;
  if (!response || typeof response !== 'object') return null;

  const candidates: unknown[] = [];
  const generateVideoResponse = (response as any).generateVideoResponse;
  if (generateVideoResponse?.generatedSamples?.[0]?.video) {
    candidates.push(generateVideoResponse.generatedSamples[0].video);
  }
  if ((response as any).generatedVideos?.[0]) {
    candidates.push((response as any).generatedVideos[0]);
  }
  if ((response as any).video) {
    candidates.push((response as any).video);
  }

  for (const candidate of candidates) {
    const uri = (candidate as any)?.uri ?? (candidate as any)?.videoUri ?? (candidate as any)?.fileUri;
    if (typeof uri === 'string' && uri.length > 0) return uri;
  }

  return null;
}

function buildVideoPrompt(params: { expression: string; story: string }): string {
  return [
    'Create one short cinematic video clip (8-10 seconds) for an English learning example.',
    `Target expression: "${params.expression}".`,
    'Show a simple daily-life scene with 1-2 people and clear action.',
    'No subtitles, no watermark, no on-screen text.',
    'Natural camera movement, realistic lighting, family-friendly tone.',
    'Use this story context:',
    params.story,
  ].join('\n');
}

async function pollOperation(operationName: string): Promise<VideoOperation> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < MAX_POLL_MS) {
    const response = await fetch(
      `${VEO_BASE_URL}/${operationName}?key=${GEMINI_API_KEY}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Veo operation poll error (${response.status}): ${errorText}`);
    }

    const operation = (await response.json()) as VideoOperation;
    const state = String((operation as any)?.metadata?.state ?? '').toUpperCase();
    const hasTerminalState =
      operation.done === true ||
      Boolean(operation.response) ||
      Boolean(operation.error) ||
      state === 'SUCCEEDED' ||
      state === 'FAILED' ||
      state === 'CANCELLED';

    if (hasTerminalState) return operation;

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error('Veo video generation timed out');
}

export async function generateStoryVideo(params: {
  expression: string;
  story: string;
}): Promise<{ uri: string; headers: Record<string, string> }> {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY');
  }

  const prompt = buildVideoPrompt(params);
  const response = await fetch(
    `${VEO_BASE_URL}/models/${VEO_MODEL}:predictLongRunning?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          {
            prompt,
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Veo request error (${response.status}): ${errorText}`);
  }

  const operation = (await response.json()) as VideoOperation;
  const operationName = operation?.name;
  if (!operationName) {
    throw new Error('Veo operation name missing');
  }

  const doneOperation = operation.done ? operation : await pollOperation(operationName);
  if (doneOperation.error) {
    throw new Error(
      `Veo operation failed: ${doneOperation.error.message ?? doneOperation.error.status ?? 'Unknown'}`
    );
  }

  const uri = extractVideoUri(doneOperation);
  if (!uri) {
    throw new Error('Veo response does not include a playable video URI');
  }

  return {
    uri,
    headers: {
      'x-goog-api-key': GEMINI_API_KEY,
    },
  };
}
