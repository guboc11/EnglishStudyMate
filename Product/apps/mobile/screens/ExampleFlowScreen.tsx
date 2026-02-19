import { useMemo, useState } from 'react';
import { Image, View, useWindowDimensions } from 'react-native';
import { ResizeMode, Video } from 'expo-av';

import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LearningFlowLayout } from '@/screens/layouts/LearningFlowLayout';
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
          <Text size="sm">{`표현: ${expression || 'take in'}`}</Text>
        ) : null}
        {step === 2 ? (
          <View
            style={{
              width: contentWidth,
              height: 190,
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: '#e5e7eb',
            }}
          >
            <Image
              source={EXAMPLE_2_IMAGE}
              defaultSource={EXAMPLE_2_IMAGE}
              resizeMode="cover"
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </View>
        ) : null}
        {step === 3 ? (
          <View
            style={{
              width: contentWidth,
              height: 210,
              borderRadius: 12,
              overflow: "hidden",
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
