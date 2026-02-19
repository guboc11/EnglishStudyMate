export type ImagePageKey = 'example2' | 'review1' | 'review2' | 'review3';

export type GeneratedImageState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  uri?: string;
  error?: string;
};
