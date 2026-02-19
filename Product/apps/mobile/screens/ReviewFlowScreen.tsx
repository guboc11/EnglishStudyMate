import { useState } from 'react';
import { Image, View, useWindowDimensions } from 'react-native';

import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LearningFlowLayout } from '@/screens/layouts/LearningFlowLayout';
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
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(Math.max(width - 32, 280), 360);

  const story =
    step === 1 ? bundle.review1.story : step === 2 ? bundle.review2.story : bundle.review3.story;
  const highlightedStory = splitByExpressionMatch(story, expression);

  const handleNext = () => {
    setStep((prev) => (prev < 3 ? ((prev + 1) as ReviewStep) : prev));
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
          {`복습 페이지 ${step}`}
        </Text>
        <View
          style={{
            width: contentWidth,
            height: 190,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: '#e5e7eb',
          }}
        >
          <Image
            source={REVIEW_IMAGE}
            defaultSource={REVIEW_IMAGE}
            resizeMode="cover"
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </View>
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
