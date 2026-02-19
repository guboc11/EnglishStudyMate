import { apiGet, apiPost, apiUrl } from '@/services/apiClient';

type VideoJobCreateResponse = {
  jobId: string;
  status: 'processing' | 'queued';
};

type VideoJobStatusResponse = {
  jobId: string;
  status: 'processing' | 'ready' | 'error';
  message?: string;
};

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_MS = 180000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitUntilReady(jobId: string): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < MAX_POLL_MS) {
    const status = await apiGet<VideoJobStatusResponse>(`/api/v1/media/video/jobs/${jobId}`);
    if (status.status === 'ready') return;
    if (status.status === 'error') {
      throw new Error(status.message || 'Video generation failed');
    }
    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error('Video generation timed out');
}

export async function generateStoryVideo(params: {
  expression: string;
  story: string;
}): Promise<{ uri: string; headers?: Record<string, string> }> {
  const created = await apiPost<VideoJobCreateResponse>('/api/v1/media/video/jobs', params);
  if (!created?.jobId) {
    throw new Error('Video job creation failed');
  }

  await waitUntilReady(created.jobId);

  return {
    uri: apiUrl(`/api/v1/media/video/jobs/${created.jobId}/stream`),
  };
}
