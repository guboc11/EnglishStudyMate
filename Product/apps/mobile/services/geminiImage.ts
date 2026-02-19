import type { ImagePageKey } from '@/types/image';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_IMAGE_MODEL =
  process.env.EXPO_PUBLIC_GEMINI_IMAGE_MODEL ?? 'gemini-2.5-flash-image';
const GEMINI_IMAGE_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`;

function buildImagePrompt(params: {
  expression: string;
  story: string;
  pageKey: ImagePageKey;
}): string {
  const { expression, story, pageKey } = params;

  return [
    `Create a single cartoon-style illustration for page "${pageKey}".`,
    `Target expression: "${expression}".`,
    'Style: kid-friendly, soft cartoon, clean lines, warm colors, clear subject, daily-life atmosphere.',
    'Keep one scene only. No split panel.',
    'No text, no captions, no watermark, no logo.',
    'Use this story context as visual guidance:',
    story,
  ].join('\n');
}

function extractImageUri(payload: any): string | null {
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

export async function generateCartoonImage(params: {
  expression: string;
  story: string;
  pageKey: ImagePageKey;
}): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY');
  }

  const prompt = buildImagePrompt(params);
  const response = await fetch(`${GEMINI_IMAGE_ENDPOINT}?key=${GEMINI_API_KEY}`, {
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
  if (!uri) {
    throw new Error('Gemini image API returned no image data');
  }

  return uri;
}
