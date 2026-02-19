import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ExampleFlowScreen } from '@/screens/ExampleFlowScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { ReviewFlowScreen } from '@/screens/ReviewFlowScreen';
import { generateExample1Story } from '@/services/gemini';
import '@/global.css';

type RootStackParamList = {
  Home: undefined;
  ExampleFlow: {
    expression: string;
    example1Story?: string;
  };
  ReviewFlow: undefined;
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
                    const generated = await generateExample1Story(expression);
                    navigation.navigate('ExampleFlow', {
                      expression,
                      example1Story: generated,
                    });
                  } catch (error) {
                    console.warn('Gemini generation failed, using fallback story:', error);
                    navigation.navigate('ExampleFlow', {
                      expression,
                    });
                  } finally {
                    setIsSearching(false);
                  }
                }}
                onReviewPress={() => navigation.navigate('ReviewFlow')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ExampleFlow">
            {({ navigation, route }) => (
              <ExampleFlowScreen
                onClose={() => navigation.popToTop()}
                onReviewPress={() => navigation.replace('ReviewFlow')}
                expression={route.params?.expression ?? 'take in'}
                example1Story={route.params?.example1Story}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ReviewFlow">
            {({ navigation }) => (
              <ReviewFlowScreen
                onClose={() => navigation.popToTop()}
                onComplete={() => navigation.popToTop()}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </GluestackUIProvider>
  );
}
