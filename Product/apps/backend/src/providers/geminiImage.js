const { buildImagePrompt } = require('../lib/prompts');

const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

function getEndpoint() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
  return {
    apiKey,
    endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`,
  };
}

function extractImageUri(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;

  for (const part of parts) {
    const inlineData = part?.inlineData;
    if (inlineData?.data && inlineData?.mimeType) {
      return `data:${inlineData.mimeType};base64,${inlineData.data}`;
    }

    const fileData = part?.fileData;
    if (typeof fileData?.fileUri === 'string' && fileData.fileUri.length > 0) {
      return fileData.fileUri;
    }
    if (typeof fileData?.uri === 'string' && fileData.uri.length > 0) {
      return fileData.uri;
    }
  }

  return null;
}

async function generateImage(params) {
  const { endpoint, apiKey } = getEndpoint();
  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: buildImagePrompt(params) }] }],
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini image API error (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const uri = extractImageUri(payload);
  if (!uri) throw new Error('Gemini image API returned no image data');

  return uri;
}

module.exports = {
  generateImage,
};
