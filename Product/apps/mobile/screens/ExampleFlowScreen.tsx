import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  type ImageLoadEventData,
  type NativeSyntheticEvent,
  View,
  useWindowDimensions,
} from 'react-native';
import { ResizeMode, Video } from 'expo-av';

import { Button, ButtonText } from '@/components/ui/button';
import { generateCartoonImage } from '@/services/geminiImage';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LearningFlowLayout } from '@/screens/layouts/LearningFlowLayout';
import type { GeneratedImageState } from '@/types/image';
import type { LearningBundle } from '@/types/learning';
import { splitByExpressionMatch } from '@/utils/highlightExpression';

type ExampleFlowScreenProps = {
  onClose: () => void;
  onReviewPress: () => void;
  expression: string;
  bundle: LearningBundle;
};

type ExampleStep = 1 | 2 | 3;
const EXAMPLE_2_IMAGE = require('../assets/example2.png');
const EXAMPLE_3_VIDEO = require('../assets/example3.mp4');

export function ExampleFlowScreen({
  onClose,
  onReviewPress,
  expression,
  bundle,
}: ExampleFlowScreenProps) {
  const [step, setStep] = useState<ExampleStep>(1);
  const [example2Image, setExample2Image] = useState<GeneratedImageState>({
    status: 'idle',
  });
  const [example2AspectRatio, setExample2AspectRatio] = useState(1.6);
  const requestIdRef = useRef(0);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(Math.max(width - 32, 280), 360);

  const story = useMemo(() => {
    if (step === 1) return bundle.example1.story;
    if (step === 2) return bundle.example2.story;
    return bundle.example3.story;
  }, [bundle, step]);
  const highlightedStory = useMemo(
    () => splitByExpressionMatch(story, expression),
    [story, expression]
  );

  const handleNext = () => {
    setStep((prev) => (prev < 3 ? ((prev + 1) as ExampleStep) : prev));
  };

  const fetchExample2Image = async () => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    setExample2Image({ status: 'loading' });

    try {
      const uri = await generateCartoonImage({
        expression,
        story: bundle.example2.story,
        pageKey: 'example2',
      });
      if (requestId !== requestIdRef.current) return;
      setExample2Image({ status: 'ready', uri });
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setExample2Image({
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  useEffect(() => {
    if (step !== 2) return;
    void fetchExample2Image();
  }, [step]);

  const handleExample2ImageLoad = (event: NativeSyntheticEvent<ImageLoadEventData>) => {
    const width = event.nativeEvent?.source?.width ?? 0;
    const height = event.nativeEvent?.source?.height ?? 0;
    if (width > 0 && height > 0) {
      setExample2AspectRatio(width / height);
    }
  };

  return (
    <LearningFlowLayout onClose={onClose}>
      <VStack
        className="gap-5"
        style={{
          width: contentWidth,
        }}
      >
        <Text size="xl" bold>
          {`예문 ${step}`}
        </Text>
        {step === 1 ? (
          <Text size="sm">
            {`표현: ${bundle.selectionMeta.selectedPhrase || expression || 'take in'} | 의미: ${
              bundle.selectionMeta.selectedSenseLabelKo
            } | 도메인: ${bundle.selectionMeta.selectedDomain}`}
          </Text>
        ) : null}
        {step === 2 ? (
          <>
            <View
              style={{
                width: contentWidth,
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: '#e5e7eb',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {example2Image.status === 'loading' ? (
                <VStack className="items-center gap-2">
                  <ActivityIndicator size="small" color="#374151" />
                  <Text size="sm">이미지 생성중...</Text>
                </VStack>
              ) : (
                <Image
                  source={
                    example2Image.status === 'ready' && example2Image.uri
                      ? { uri: example2Image.uri }
                      : EXAMPLE_2_IMAGE
                  }
                  defaultSource={EXAMPLE_2_IMAGE}
                  resizeMode="contain"
                  onLoad={handleExample2ImageLoad}
                  style={{
                    width: '100%',
                    aspectRatio: example2AspectRatio,
                  }}
                />
              )}
            </View>
            {example2Image.status === 'error' ? (
              <Button size="sm" action="secondary" onPress={() => void fetchExample2Image()}>
                <ButtonText>이미지 다시 생성</ButtonText>
              </Button>
            ) : null}
          </>
        ) : null}
        {step === 3 ? (
          <View
            style={{
              width: contentWidth,
              height: 210,
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: '#111827',
            }}
          >
            <Video
              source={EXAMPLE_3_VIDEO}
              style={{ width: '100%', height: '100%' }}
              resizeMode={ResizeMode.COVER}
              useNativeControls
              shouldPlay
              isLooping
            />
          </View>
        ) : null}
        <Text size="md">
          {highlightedStory.map((segment, index) => (
            <Text key={`${segment.text}-${index}`} size="md" bold={segment.isMatch}>
              {segment.text}
            </Text>
          ))}
        </Text>
        <Button
          size="lg"
          action="primary"
          onPress={handleNext}
          isDisabled={step === 3}
        >
          <ButtonText>예문 더보기</ButtonText>
        </Button>
        {step === 3 ? (
          <Button size="lg" action="secondary" onPress={onReviewPress}>
            <ButtonText>복습하기</ButtonText>
          </Button>
        ) : null}
      </VStack>
    </LearningFlowLayout>
  );
}
