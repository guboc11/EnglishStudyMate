import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ExampleFlowScreen } from '@/screens/ExampleFlowScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { MeaningGateScreen } from '@/screens/MeaningGateScreen';
import { MeaningScreen } from '@/screens/MeaningScreen';
import { ReviewSessionScreen } from '@/screens/ReviewSessionScreen';
import {
  resolveAndGenerateLearning,
} from '@/services/gemini';
import { addSearchHistory } from '@/services/searchHistory';
import { addExpressionToProfile } from '@/services/vocabularyProfile';
import type { LearningBundle } from '@/types/learning';
import type { ResolveAndGenerateResult } from '@/types/selection';
import '@/global.css';

type RootStackParamList = {
  Home: undefined;
  MeaningGate: {
    rawInput: string;
    initialResult?: ResolveAndGenerateResult;
  };
  ExampleFlow: {
    expression: string;
    bundle: LearningBundle;
  };
  Meaning: {
    expression: string;
    bundle: LearningBundle;
  };
  ReviewSession: undefined;
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
                    const result = await resolveAndGenerateLearning({
                      input: expression,
                    });

                    if (result.status === 'ready') {
                      await addSearchHistory(result.expression);
                      await addExpressionToProfile(result.expression, result.bundle);
                      navigation.navigate('ExampleFlow', {
                        expression: result.expression,
                        bundle: result.bundle,
                      });
                      return;
                    }

                    navigation.navigate('MeaningGate', {
                      rawInput: expression,
                      initialResult: result,
                    });
                  } catch {
                    navigation.navigate('MeaningGate', {
                      rawInput: expression,
                    });
                  } finally {
                    setIsSearching(false);
                  }
                }}
                onReviewPress={() => navigation.navigate('ReviewSession')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="MeaningGate">
            {({ navigation, route }) => (
              <MeaningGateScreen
                rawInput={route.params.rawInput}
                initialResult={route.params.initialResult}
                onClose={() => navigation.popToTop()}
                onResolved={(expression, bundle) => {
                  void addExpressionToProfile(expression, bundle);
                  navigation.replace('ExampleFlow', {
                    expression,
                    bundle,
                  });
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ExampleFlow">
            {({ navigation, route }) => (
              <ExampleFlowScreen
                onClose={() => navigation.popToTop()}
                onMeaningPress={() =>
                  navigation.navigate('Meaning', {
                    expression: route.params.expression,
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
          <Stack.Screen name="ReviewSession">
            {({ navigation }) => (
              <ReviewSessionScreen onClose={() => navigation.popToTop()} />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </GluestackUIProvider>
  );
}
