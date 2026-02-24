import { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { setFamiliarity } from '@/services/vocabularyProfile';
import type { FamiliarityLevel, VocabularyEntry } from '@/types/vocabularyProfile';

type ReviewEndScreenProps = {
  entries: VocabularyEntry[];
  onDone: () => void;
};

const FAMILIARITY_BUTTONS: { level: FamiliarityLevel; label: string }[] = [
  { level: 'known', label: '알' },
  { level: 'fuzzy', label: '흐' },
  { level: 'unknown', label: '모' },
];

export function ReviewEndScreen({ entries, onDone }: ReviewEndScreenProps) {
  const [ratings, setRatings] = useState<Record<string, FamiliarityLevel | null>>(
    () => Object.fromEntries(entries.map((e) => [e.expression, e.familiarity ?? null]))
  );

  const handleRate = (expression: string, level: FamiliarityLevel) => {
    setRatings((prev) => ({ ...prev, [expression]: level }));
  };

  const handleDone = async () => {
    for (const entry of entries) {
      const level = ratings[entry.expression];
      if (level && level !== entry.familiarity) {
        await setFamiliarity(entry.expression, level);
      }
    }
    onDone();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF7F2' }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 32,
          alignItems: 'center',
        }}
      >
        <VStack className="w-full max-w-[360px] gap-6">
          <VStack className="gap-1">
            <Text size="2xl" bold style={{ textAlign: 'center', color: '#2C2C2C' }}>
              복습 완료!
            </Text>
            <Text size="md" style={{ textAlign: 'center', color: '#6B5C4C' }}>
              {`${entries.length}개 표현을 복습했습니다`}
            </Text>
          </VStack>

          <Text size="sm" bold style={{ color: '#2C2C2C' }}>
            이번 복습 표현 평가
          </Text>

          {entries.map((entry) => (
            <View
              key={entry.expression}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: '#E8E0D5',
              }}
            >
              <Text size="md" bold style={{ flex: 1, color: '#2C2C2C' }}>
                {entry.expression}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {FAMILIARITY_BUTTONS.map(({ level, label }) => {
                  const isSelected = ratings[entry.expression] === level;
                  return (
                    <TouchableOpacity
                      key={level}
                      onPress={() => handleRate(entry.expression, level)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 6,
                        backgroundColor: isSelected ? '#D97706' : '#E8E0D5',
                      }}
                    >
                      <Text
                        size="sm"
                        bold
                        style={{ color: isSelected ? '#FFFFFF' : '#6B5C4C' }}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <Button
            size="lg"
            action="primary"
            onPress={() => void handleDone()}
            style={{ backgroundColor: '#D97706' }}
          >
            <ButtonText>홈으로</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
