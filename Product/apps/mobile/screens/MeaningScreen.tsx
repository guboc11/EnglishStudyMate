import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LearningFlowLayout } from '@/screens/layouts/LearningFlowLayout';
import type { LearningBundle } from '@/types/learning';

type MeaningScreenProps = {
  expression: string;
  bundle: LearningBundle;
  onClose: () => void;
  onDone: () => void;
};

export function MeaningScreen({ expression, bundle, onClose, onDone }: MeaningScreenProps) {
  const meaning = bundle.meaning;

  return (
    <LearningFlowLayout onClose={onClose}>
      <VStack className="w-full max-w-[360px] gap-4">
        <Text size="xl" bold>
          뜻 보기
        </Text>
        <Text size="sm">{`표현: ${expression}`}</Text>

        <Text size="sm" bold>
          뜻
        </Text>
        <Text size="md">{meaning.literalMeaningKo}</Text>

        <Text size="sm" bold>
          실제 의미
        </Text>
        <Text size="md">{meaning.realUsageKo}</Text>

        <Text size="sm" bold>
          어원
        </Text>
        <Text size="md">{meaning.etymologyKo}</Text>

        <Text size="sm" bold>
          뉘앙스
        </Text>
        <Text size="md">{meaning.nuanceKo}</Text>

        <Text size="sm" bold>
          아주 짧은 예문
        </Text>
        <Text size="md">{meaning.shortExampleEn}</Text>
        <Text size="sm">{meaning.shortExampleKo}</Text>

        <Button size="lg" action="primary" onPress={onDone}>
          <ButtonText>홈으로 이동</ButtonText>
        </Button>
      </VStack>
    </LearningFlowLayout>
  );
}
