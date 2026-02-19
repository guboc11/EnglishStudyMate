import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import '@/global.css';

type Page = 'search' | 'example1';

const EXAMPLE_1_STORY = `One day, I was walking home when I saw a small cat shivering in the rain.
I hesitated for a moment, but I couldn’t just leave it there, so I decided to take it in.
After I brought it home and gave it warm food and a towel, the cat slowly calmed down.
From that day on, the cat stayed with me, and I took care of it as part of my home.`;

export default function App() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState<Page>('search');

  return (
    <GluestackUIProvider mode="light">
      {page === 'search' ? (
        <Box className="flex-1 items-center justify-center bg-background-50 px-5">
          <VStack className="w-full max-w-[360px] gap-3">
            <Input size="lg" variant="outline">
              <InputField
                placeholder="검색할 단어를 입력하세요"
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </Input>
            <Button size="lg" action="primary" onPress={() => setPage('example1')}>
              <ButtonText>단어 검색</ButtonText>
            </Button>
          </VStack>
        </Box>
      ) : (
        <Box className="flex-1 items-center justify-center bg-background-50 px-5">
          <VStack className="w-full max-w-[360px] gap-5">
            <Text size="xl" bold>
              예문 1
            </Text>
            <Text size="md">{EXAMPLE_1_STORY}</Text>
            <Button size="lg" action="primary">
              <ButtonText>예문 더보기</ButtonText>
            </Button>
          </VStack>
        </Box>
      )}
      <StatusBar style="auto" />
    </GluestackUIProvider>
  );
}
