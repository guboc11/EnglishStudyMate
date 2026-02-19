import { useMemo, useState } from 'react';
import { Image, View, useWindowDimensions } from 'react-native';

import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LearningFlowLayout } from '@/screens/layouts/LearningFlowLayout';

type ExampleFlowScreenProps = {
  onClose: () => void;
};

type ExampleStep = 1 | 2 | 3;
const EXAMPLE_2_IMAGE = require('../assets/example2.png');

const EXAMPLE_1_STORY = `One day, I was walking home when I saw a small cat shivering in the rain.
I hesitated for a moment, but I couldn't just leave it there, so I decided to take it in.
After I brought it home and gave it warm food and a towel, the cat slowly calmed down.
From that day on, the cat stayed with me, and I took care of it as part of my home.`;

const EXAMPLE_2_STORY = `At first, taking the cat in felt like a small choice, but it changed my daily life.
Every morning, it waited near the kitchen while I prepared breakfast and watched me quietly.
When I came back late from work, it ran to the door and made the house feel less empty.
Looking back, that rainy day became the start of a warm routine I did not expect.`;

const EXAMPLE_3_STORY = `A few months later, the cat had grown stronger and followed me from room to room.
Friends who visited often said the cat seemed to trust people more than before.
I realized that taking it in was not only about helping an animal, but also about changing myself.
What began as a moment of hesitation became one of the best decisions I had made.`;

export function ExampleFlowScreen({ onClose }: ExampleFlowScreenProps) {
  const [step, setStep] = useState<ExampleStep>(1);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(Math.max(width - 32, 280), 360);

  const story = useMemo(() => {
    if (step === 1) return EXAMPLE_1_STORY;
    if (step === 2) return EXAMPLE_2_STORY;
    return EXAMPLE_3_STORY;
  }, [step]);

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
        {step === 2 ? (
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
        <Text size="md">{story}</Text>
        <Button
          size="lg"
          action="primary"
          onPress={handleNext}
          isDisabled={step === 3}
        >
          <ButtonText>예문 더보기</ButtonText>
        </Button>
      </VStack>
    </LearningFlowLayout>
  );
}
