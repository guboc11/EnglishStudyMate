import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiBaseUrl(): string {
  // Expo Go(실기기)에서 localhost는 폰 자체를 가리킴.
  // Metro 서버 hostUri(예: "192.168.0.11:8081")에서 IP를 추출해 백엔드 포트로 연결.
  if (__DEV__ && Platform.OS !== 'web') {
    const hostUri = Constants.expoConfig?.hostUri; // "192.168.x.x:8081"
    if (hostUri) {
      const host = hostUri.split(':')[0];
      return `http://${host}:8787`;
    }
  }

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
