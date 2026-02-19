import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LearningFlowLayout } from '@/screens/layouts/LearningFlowLayout';

type Review1ScreenProps = {
  onClose: () => void;
};

export function Review1Screen({ onClose }: Review1ScreenProps) {
  return (
    <LearningFlowLayout onClose={onClose}>
      <VStack className="w-full max-w-[360px] gap-5">
        <Text size="xl" bold>
          복습 페이지 1
        </Text>
        <Text size="md">
          여기에 복습 스토리 1페이지 콘텐츠가 들어갑니다.
        </Text>
        <Button size="lg" action="primary">
          <ButtonText>다음 복습</ButtonText>
        </Button>
      </VStack>
    </LearningFlowLayout>
  );
}
