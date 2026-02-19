function resolveApiBaseUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('Missing EXPO_PUBLIC_API_BASE_URL');
  }
  return baseUrl.replace(/\/$/, '');
}

async function parseError(response: Response): Promise<string> {
  const fallback = `API request failed (${response.status})`;
  try {
    const data = await response.json();
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${resolveApiBaseUrl()}${path}`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return (await response.json()) as T;
}

export function apiUrl(path: string): string {
  return `${resolveApiBaseUrl()}${path}`;
}
