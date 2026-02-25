const { buildVideoPrompt } = require('../lib/prompts');

const VEO_MODEL = process.env.VEO_MODEL || 'veo-3.1-generate-preview';
const VEO_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_MS = 180000;

function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
  return apiKey;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function extractVideoUri(operation) {
  const response = operation?.response;
  if (!response || typeof response !== 'object') return null;

  const candidates = [];
  const generateVideoResponse = response.generateVideoResponse;
  if (generateVideoResponse?.generatedSamples?.[0]?.video) {
    candidates.push(generateVideoResponse.generatedSamples[0].video);
  }
  if (response.generatedVideos?.[0]) {
    candidates.push(response.generatedVideos[0]);
  }
  if (response.video) {
    candidates.push(response.video);
  }

  for (const candidate of candidates) {
    const uri = candidate?.uri || candidate?.videoUri || candidate?.fileUri;
    if (typeof uri === 'string' && uri.length > 0) return uri;
  }

  return null;
}

async function pollOperation(operationName, apiKey) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < MAX_POLL_MS) {
    const response = await fetch(`${VEO_BASE_URL}/${operationName}?key=${apiKey}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Veo operation poll error (${response.status}): ${errorText}`);
    }

    const operation = await response.json();
    const state = String(operation?.metadata?.state || '').toUpperCase();
    const terminal =
      operation.done === true ||
      Boolean(operation.response) ||
      Boolean(operation.error) ||
      state === 'SUCCEEDED' ||
      state === 'FAILED' ||
      state === 'CANCELLED';

    if (terminal) return operation;
    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error('Veo video generation timed out');
}

async function generateVideo(params) {
  const apiKey = getApiKey();
  const response = await fetch(
    `${VEO_BASE_URL}/models/${VEO_MODEL}:predictLongRunning?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: buildVideoPrompt(params) }],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Veo request error (${response.status}): ${errorText}`);
  }

  const operation = await response.json();
  const operationName = operation?.name;
  if (!operationName) throw new Error('Veo operation name missing');

  const doneOperation = operation.done ? operation : await pollOperation(operationName, apiKey);
  if (doneOperation.error) {
    throw new Error(
      `Veo operation failed: ${doneOperation.error.message || doneOperation.error.status || 'Unknown'}`
    );
  }

  const uri = extractVideoUri(doneOperation);
  if (!uri) throw new Error('Veo response does not include a playable video URI');
  return uri;
}

async function streamVideo(uri, destination) {
  const apiKey = getApiKey();
  const response = await fetch(uri, {
    headers: {
      'x-goog-api-key': apiKey,
    },
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    throw new Error(`Video stream fetch failed (${response.status}): ${errorText}`);
  }

  const contentType = response.headers.get('content-type') || 'video/mp4';
  const contentLength = response.headers.get('content-length');
  destination.setHeader('Content-Type', contentType);
  if (contentLength) destination.setHeader('Content-Length', contentLength);

  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    destination.write(Buffer.from(value));
  }
  destination.end();
}

module.exports = {
  generateVideo,
  streamVideo,
};
