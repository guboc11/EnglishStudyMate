import { useCallback, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type HomeScreenProps = {
  onSearchPress: (query: string) => void;
  onReviewPress: () => void;
  isSearching: boolean;
};

export function HomeScreen({
  onSearchPress,
  onReviewPress,
  isSearching,
}: HomeScreenProps) {
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { width } = useWindowDimensions();
  const contentWidth = Math.round(width * (2 / 3));

  useFocusEffect(
    useCallback(() => {
      setQuery('');
      setErrorMessage('');
    }, [])
  );

  const handleSearchPress = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setErrorMessage('학습하고 싶은 단어/구문을 입력하세요');
      return;
    }

    setErrorMessage('');
    onSearchPress(trimmed);
  };

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
            onChangeText={(text) => {
              setQuery(text);
              if (errorMessage && text.trim().length > 0) {
                setErrorMessage('');
              }
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Input>
        {errorMessage ? (
          <Text size="sm" style={{ color: '#dc2626' }}>
            {errorMessage}
          </Text>
        ) : null}
        <Button
          size="lg"
          action="primary"
          onPress={handleSearchPress}
          isDisabled={isSearching}
        >
          <ButtonText>{isSearching ? '생성 중...' : '단어 검색'}</ButtonText>
        </Button>
        <Button size="lg" action="secondary" onPress={onReviewPress}>
          <ButtonText>복습하기</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
