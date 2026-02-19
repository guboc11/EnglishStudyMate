import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LearningFlowLayout } from '@/screens/layouts/LearningFlowLayout';
import { getSearchHistory } from '@/services/searchHistory';

type SearchHistoryScreenProps = {
  onClose: () => void;
};

export function SearchHistoryScreen({ onClose }: SearchHistoryScreenProps) {
  const [items, setItems] = useState<string[]>([]);

  const loadHistory = useCallback(async () => {
    const history = await getSearchHistory();
    setItems(history);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory])
  );

  return (
    <LearningFlowLayout onClose={onClose}>
      <VStack className="w-full max-w-[360px] gap-4">
        <Text size="xl" bold>
          지금까지 검색한 단어/구문
        </Text>

        {items.length === 0 ? (
          <Text size="md">아직 검색 기록이 없습니다.</Text>
        ) : (
          <VStack className="gap-2">
            {items.map((item, index) => (
              <Text key={`${item}-${index}`} size="md">{`${index + 1}. ${item}`}</Text>
            ))}
          </VStack>
        )}

        <Button size="lg" action="primary" onPress={onClose}>
          <ButtonText>홈으로 이동</ButtonText>
        </Button>
      </VStack>
    </LearningFlowLayout>
  );
}
