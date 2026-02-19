import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, View, useWindowDimensions } from 'react-native';

import { Button, ButtonText } from '@/components/ui/button';
import { generateCartoonImage } from '@/services/geminiImage';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LearningFlowLayout } from '@/screens/layouts/LearningFlowLayout';
import type { GeneratedImageState, ImagePageKey } from '@/types/image';
import type { LearningBundle } from '@/types/learning';
import { splitByExpressionMatch } from '@/utils/highlightExpression';

type ReviewFlowScreenProps = {
  onClose: () => void;
  onComplete: () => void;
  expression: string;
  bundle: LearningBundle;
};

type ReviewStep = 1 | 2 | 3;

const REVIEW_IMAGE = require('../assets/example2.png');

export function ReviewFlowScreen({
  onClose,
  onComplete,
  expression,
  bundle,
}: ReviewFlowScreenProps) {
  const [step, setStep] = useState<ReviewStep>(1);
  const [reviewImage, setReviewImage] = useState<GeneratedImageState>({
    status: 'idle',
  });
  const requestIdRef = useRef(0);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(Math.max(width - 32, 280), 360);

  const pageInfo = useMemo(() => {
    if (step === 1) {
      return { pageKey: 'review1' as ImagePageKey, story: bundle.review1.story };
    }
    if (step === 2) {
      return { pageKey: 'review2' as ImagePageKey, story: bundle.review2.story };
    }
    return { pageKey: 'review3' as ImagePageKey, story: bundle.review3.story };
  }, [bundle.review1.story, bundle.review2.story, bundle.review3.story, step]);

  const story = pageInfo.story;
  const highlightedStory = splitByExpressionMatch(story, expression);

  const handleNext = () => {
    setStep((prev) => (prev < 3 ? ((prev + 1) as ReviewStep) : prev));
  };

  const fetchReviewImage = async () => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    setReviewImage({ status: 'loading' });

    try {
      const uri = await generateCartoonImage({
        expression,
        story: pageInfo.story,
        pageKey: pageInfo.pageKey,
      });
      if (requestId !== requestIdRef.current) return;
      setReviewImage({ status: 'ready', uri });
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setReviewImage({
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  useEffect(() => {
    void fetchReviewImage();
  }, [step]);

  return (
    <LearningFlowLayout onClose={onClose}>
      <VStack
        className="gap-5"
        style={{
          width: contentWidth,
        }}
      >
        <Text size="xl" bold>
          {`복습 페이지 ${step}`}
        </Text>
        <View
          style={{
            width: contentWidth,
            height: 190,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: '#e5e7eb',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {reviewImage.status === 'loading' ? (
            <VStack className="items-center gap-2">
              <ActivityIndicator size="small" color="#374151" />
              <Text size="sm">이미지 생성중...</Text>
            </VStack>
          ) : (
            <Image
              source={
                reviewImage.status === 'ready' && reviewImage.uri
                  ? { uri: reviewImage.uri }
                  : REVIEW_IMAGE
              }
              defaultSource={REVIEW_IMAGE}
              resizeMode="cover"
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          )}
        </View>
        {reviewImage.status === 'error' ? (
          <Button size="sm" action="secondary" onPress={() => void fetchReviewImage()}>
            <ButtonText>이미지 다시 생성</ButtonText>
          </Button>
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
          action={step === 3 ? 'secondary' : 'primary'}
          onPress={step === 3 ? onComplete : handleNext}
        >
          <ButtonText>{step === 3 ? '복습 완료' : '다음 복습'}</ButtonText>
        </Button>
        {step === 3 ? (
          <Button size="lg" action="primary" onPress={() => setStep(1)}>
            <ButtonText>복습 더하기</ButtonText>
          </Button>
        ) : null}
      </VStack>
    </LearningFlowLayout>
  );
}
