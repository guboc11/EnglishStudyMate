import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';

const REVIEW_COUNTDOWN_SECONDS = 3;

type ReviewCountdownScreenProps = {
  onStart: () => void;
};

export function ReviewCountdownScreen({ onStart }: ReviewCountdownScreenProps) {
  const [count, setCount] = useState<number>(REVIEW_COUNTDOWN_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onStart();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onStart]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF7F2' }}>
      <TouchableOpacity
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        onPress={onStart}
        activeOpacity={1}
      >
        <View style={{ alignItems: 'center', gap: 24 }}>
          <Text size="xl" style={{ color: '#2C2C2C' }}>
            복습을 시작합니다
          </Text>
          <Text
            bold
            style={{ fontSize: 80, lineHeight: 96, color: '#D97706' }}
          >
            {count}
          </Text>
          <Text size="sm" style={{ color: '#6B5C4C' }}>
            탭하면 바로 시작
          </Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
