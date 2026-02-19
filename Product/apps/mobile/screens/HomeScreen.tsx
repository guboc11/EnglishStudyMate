import { useState } from 'react';
import { useWindowDimensions } from 'react-native';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';

type HomeScreenProps = {
  onSearchPress: () => void;
};

export function HomeScreen({ onSearchPress }: HomeScreenProps) {
  const [query, setQuery] = useState('');
  const { width } = useWindowDimensions();
  const contentWidth = Math.round(width * (2 / 3));

  return (
    <Box className="flex-1 items-center justify-center bg-background-50 px-4">
      <VStack
        className="gap-3"
        style={{
          width: contentWidth,
        }}
      >
        <Input size="lg" variant="outline">
          <InputField
            placeholder="검색할 단어를 입력하세요"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Input>
        <Button size="lg" action="primary" onPress={onSearchPress}>
          <ButtonText>단어 검색</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
