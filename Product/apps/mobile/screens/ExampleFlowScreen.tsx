import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  type ImageLoadEventData,
  type NativeSyntheticEvent,
  View,
  useWindowDimensions,
} from 'react-native';

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
  onMeaningPress: () => void;
  expression: string;
  bundle: LearningBundle;
};

type ExampleStep = 1 | 2 | 3;

const FALLBACK_IMAGE = require('../assets/example2.png');

const STEP_LABEL: Record<ExampleStep, string> = {
  1: '맥락 문장',
  2: '짧은 이야기',
  3: '심화 이야기',
};

export function ExampleFlowScreen({
  onClose,
  onMeaningPress,
  expression,
  bundle,
}: ExampleFlowScreenProps) {
  const [step, setStep] = useState<ExampleStep>(1);
  const [stepImage, setStepImage] = useState<GeneratedImageState>({ status: 'idle' });
  const [imageAspectRatio, setImageAspectRatio] = useState(1.6);
  const imageRequestIdRef = useRef(0);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(Math.max(width - 32, 280), 360);

  const currentText = useMemo(() => {
    if (step === 1) return bundle.step1.sentence;
    if (step === 2) return bundle.step2.story;
    return bundle.step3.story;
  }, [bundle, step]);

  const highlightedText = useMemo(
    () => splitByExpressionMatch(currentText, expression),
    [currentText, expression]
  );

  const fetchStepImage = async (stepNum: 2 | 3) => {
    imageRequestIdRef.current += 1;
    const requestId = imageRequestIdRef.current;
    setStepImage({ status: 'loading' });

    const story = stepNum === 2 ? bundle.step2.story : bundle.step3.story;
    const pageKey = stepNum === 2 ? 'step2' : 'step3';

    try {
      const uri = await generateCartoonImage({ expression, story, pageKey });
      if (requestId !== imageRequestIdRef.current) return;
      setStepImage({ status: 'ready', uri });
    } catch (error) {
      if (requestId !== imageRequestIdRef.current) return;
      setStepImage({
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  useEffect(() => {
    if (step === 1) {
      setStepImage({ status: 'idle' });
      return;
    }

    const preloadedUrl = step === 2 ? bundle.step2.imageUrl : bundle.step3.imageUrl;
    if (preloadedUrl) {
      setStepImage({ status: 'ready', uri: preloadedUrl });
    } else {
      void fetchStepImage(step);
    }
  }, [step]);

  const handleImageLoad = (event: NativeSyntheticEvent<ImageLoadEventData>) => {
    const w = event.nativeEvent?.source?.width ?? 0;
    const h = event.nativeEvent?.source?.height ?? 0;
    if (w > 0 && h > 0) {
      setImageAspectRatio(w / h);
    }
  };

  const showImage = step === 2 || step === 3;

  return (
    <LearningFlowLayout onClose={onClose}>
      <VStack
        className="gap-5"
        style={{ width: contentWidth }}
      >
        <Text size="xl" bold>
          {STEP_LABEL[step]}
        </Text>
        {step === 1 ? (
          <Text size="sm">
            {`표현: ${bundle.selectionMeta.selectedPhrase || expression} | 의미: ${
              bundle.selectionMeta.selectedSenseLabelKo
            } | 도메인: ${bundle.selectionMeta.selectedDomain}`}
          </Text>
        ) : null}
        {showImage ? (
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
              {stepImage.status === 'loading' ? (
                <VStack className="items-center gap-2">
                  <ActivityIndicator size="small" color="#374151" />
                  <Text size="sm">이미지 생성중...</Text>
                </VStack>
              ) : (
                <Image
                  source={
                    stepImage.status === 'ready' && stepImage.uri
                      ? { uri: stepImage.uri }
                      : FALLBACK_IMAGE
                  }
                  defaultSource={FALLBACK_IMAGE}
                  resizeMode="contain"
                  onLoad={handleImageLoad}
                  style={{ width: '100%', aspectRatio: imageAspectRatio }}
                />
              )}
            </View>
            {stepImage.status === 'error' ? (
              <Button size="sm" action="secondary" onPress={() => void fetchStepImage(step as 2 | 3)}>
                <ButtonText>이미지 다시 생성</ButtonText>
              </Button>
            ) : null}
          </>
        ) : null}
        <Text size="md">
          {highlightedText.map((segment, index) => (
            <Text key={`${segment.text}-${index}`} size="md" bold={segment.isMatch}>
              {segment.text}
            </Text>
          ))}
        </Text>
        {step < 3 ? (
          <Button
            size="lg"
            action="primary"
            onPress={() => setStep((prev) => (prev + 1) as ExampleStep)}
          >
            <ButtonText>다음</ButtonText>
          </Button>
        ) : (
          <Button size="lg" action="secondary" onPress={onMeaningPress}>
            <ButtonText>뜻 보러 가기</ButtonText>
          </Button>
        )}
      </VStack>
    </LearningFlowLayout>
  );
}
