import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
          paddingVertical: 24,
        }}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
