import { apiPost } from '@/services/apiClient';
import type { ImagePageKey } from '@/types/image';

export async function generateCartoonImage(params: {
  expression: string;
  story: string;
  pageKey: ImagePageKey;
}): Promise<string> {
  const data = await apiPost<{ uri: string }>('/api/v1/media/image', params);
  if (!data?.uri) {
    throw new Error('Image generation returned empty URI');
  }
  return data.uri;
}
