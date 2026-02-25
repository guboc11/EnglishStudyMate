import { ResizeMode, Video } from 'expo-av';

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
  headers,
  fallbackModule,
  useFallback = false,
}: ExampleVideoPlayerProps) {
  const source = useFallback
    ? fallbackModule
    : generatedUri
      ? {
          uri: generatedUri,
          headers,
        }
      : fallbackModule;

  return (
    <Video
      source={source}
      style={{ width: '100%', height: '100%' }}
      resizeMode={ResizeMode.COVER}
      useNativeControls
      shouldPlay
      isLooping
    />
  );
}
