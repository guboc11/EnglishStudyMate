import { Platform } from 'react-native';

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

type WebProbeResult = {
  ok: boolean;
  reason?: string;
};

export type GeneratedVideoPayload = {
  uri: string;
  headers?: Record<string, string>;
  playback: 'generated' | 'fallback';
  reason?: string;
};

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_MS = 180000;
const WEB_PROBE_TIMEOUT_MS = 8000;

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

function probeWebVideo(uri: string): Promise<WebProbeResult> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve({ ok: false, reason: 'document_unavailable' });
      return;
    }

    const video = document.createElement('video');
    let done = false;

    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
    };

    const finish = (result: WebProbeResult) => {
      if (done) return;
      done = true;
      cleanup();
      resolve(result);
    };

    const timeout = setTimeout(() => {
      finish({ ok: false, reason: 'web_probe_timeout' });
    }, WEB_PROBE_TIMEOUT_MS);

    const onCanPlay = () => {
      clearTimeout(timeout);
      finish({ ok: true });
    };

    const onError = () => {
      clearTimeout(timeout);
      const mediaError = video.error;
      const detail = mediaError
        ? `media_error_${mediaError.code}_${mediaError.message || 'unknown'}`
        : 'media_error_unknown';
      finish({ ok: false, reason: detail });
    };

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.addEventListener('canplay', onCanPlay, { once: true });
    video.addEventListener('loadedmetadata', onCanPlay, { once: true });
    video.addEventListener('error', onError, { once: true });
    video.src = uri;
    video.load();
  });
}

export async function generateStoryVideo(params: {
  expression: string;
  story: string;
}): Promise<GeneratedVideoPayload> {
  const created = await apiPost<VideoJobCreateResponse>('/api/v1/media/video/jobs', params);
  if (!created?.jobId) {
    throw new Error('Video job creation failed');
  }

  await waitUntilReady(created.jobId);

  const uri = apiUrl(`/api/v1/media/video/jobs/${created.jobId}/stream`);

  if (Platform.OS === 'web') {
    const probe = await probeWebVideo(uri);
    if (!probe.ok) {
      return {
        uri,
        playback: 'fallback',
        reason: probe.reason || 'web_video_unplayable',
      };
    }
  }

  return {
    uri,
    playback: 'generated',
  };
}
