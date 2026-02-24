import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';

type LearningFlowLayoutProps = {
  children: ReactNode;
  onClose: () => void;
};

export function LearningFlowLayout({
  children,
  onClose,
}: LearningFlowLayoutProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF7F2' }}>
      <View
        style={{
          width: '100%',
          alignItems: 'flex-end',
          paddingHorizontal: 16,
          paddingTop: 4,
        }}
      >
        <Button size="sm" variant="link" action="secondary" onPress={onClose}>
          <ButtonText size="xl">X</ButtonText>
        </Button>
      </View>
      <Box className="flex-1 items-center justify-center px-4">{children}</Box>
    </SafeAreaView>
  );
}
