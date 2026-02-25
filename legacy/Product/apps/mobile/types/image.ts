export type ImagePageKey = 'step2' | 'step3';

export type GeneratedImageState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  uri?: string;
  error?: string;
};
