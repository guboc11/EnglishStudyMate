type ExampleVideoPlayerProps = {
  generatedUri?: string;
  headers?: Record<string, string>;
  fallbackModule: number;
  fallbackWebUri: string;
  useFallback?: boolean;
  onPlaybackError?: (detail: string) => void;
};

export function ExampleVideoPlayer({
  generatedUri,
  fallbackWebUri,
  useFallback = false,
  onPlaybackError,
}: ExampleVideoPlayerProps) {
  const src = useFallback ? fallbackWebUri : generatedUri;

  if (!src) {
    return null;
  }

  return (
    <video
      src={src}
      controls
      playsInline
      preload="metadata"
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      onError={(event) => {
        const element = event.currentTarget;
        const mediaError = element.error;
        onPlaybackError?.(
          mediaError
            ? `code=${mediaError.code} message=${mediaError.message || 'unknown'}`
            : 'unknown_web_video_error'
        );
      }}
    />
  );
}
