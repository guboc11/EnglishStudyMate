import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ExampleFlowScreen } from '@/screens/ExampleFlowScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { ReviewFlowScreen } from '@/screens/ReviewFlowScreen';
import {
  buildFallbackLearningBundle,
  generateLearningBundle,
} from '@/services/gemini';
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
                  navigation.navigate('ReviewFlow', {
                    expression: 'take in',
                    bundle: buildFallbackLearningBundle('take in'),
                  })
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
                onComplete={() => navigation.popToTop()}
                expression={route.params?.expression ?? 'take in'}
                bundle={route.params.bundle}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </GluestackUIProvider>
  );
}
