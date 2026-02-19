import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ExampleFlowScreen } from '@/screens/ExampleFlowScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { MeaningScreen } from '@/screens/MeaningScreen';
import { ReviewFlowScreen } from '@/screens/ReviewFlowScreen';
import { SearchHistoryScreen } from '@/screens/SearchHistoryScreen';
import {
  buildFallbackLearningBundle,
  generateLearningBundle,
} from '@/services/gemini';
import { addSearchHistory } from '@/services/searchHistory';
import type { LearningBundle } from '@/types/learning';
import '@/global.css';

type RootStackParamList = {
  Home: undefined;
  ExampleFlow: {
    expression: string;
    bundle: LearningBundle;
  };
  ReviewFlow: {
    expression: string;
    bundle: LearningBundle;
  };
  Meaning: {
    expression: string;
    bundle: LearningBundle;
  };
  SearchHistory: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isSearching, setIsSearching] = useState(false);

  return (
    <GluestackUIProvider mode="light">
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
          }}
        >
          <Stack.Screen name="Home">
            {({ navigation }) => (
              <HomeScreen
                isSearching={isSearching}
                onSearchPress={async (rawQuery) => {
                  const expression = rawQuery.trim();
                  if (!expression || isSearching) return;

                  setIsSearching(true);
                  try {
                    await addSearchHistory(expression);
                    const bundle = await generateLearningBundle(expression);
                    navigation.navigate('ExampleFlow', {
                      expression,
                      bundle,
                    });
                  } catch (error) {
                    console.warn('Gemini generation failed, using fallback bundle:', error);
                    navigation.navigate('ExampleFlow', {
                      expression,
                      bundle: buildFallbackLearningBundle(expression),
                    });
                  } finally {
                    setIsSearching(false);
                  }
                }}
                onReviewPress={() =>
                  navigation.navigate('SearchHistory')
                }
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ExampleFlow">
            {({ navigation, route }) => (
              <ExampleFlowScreen
                onClose={() => navigation.popToTop()}
                onReviewPress={() =>
                  navigation.replace('ReviewFlow', {
                    expression: route.params.expression,
                    bundle: route.params.bundle,
                  })
                }
                expression={route.params?.expression ?? 'take in'}
                bundle={route.params.bundle}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ReviewFlow">
            {({ navigation, route }) => (
              <ReviewFlowScreen
                onClose={() => navigation.popToTop()}
                onComplete={() =>
                  navigation.navigate('Meaning', {
                    expression: route.params?.expression ?? 'take in',
                    bundle: route.params.bundle,
                  })
                }
                expression={route.params?.expression ?? 'take in'}
                bundle={route.params.bundle}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Meaning">
            {({ navigation, route }) => (
              <MeaningScreen
                expression={route.params?.expression ?? 'take in'}
                bundle={route.params.bundle}
                onClose={() => navigation.popToTop()}
                onDone={() => navigation.popToTop()}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="SearchHistory">
            {({ navigation }) => (
              <SearchHistoryScreen onClose={() => navigation.popToTop()} />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </GluestackUIProvider>
  );
}
