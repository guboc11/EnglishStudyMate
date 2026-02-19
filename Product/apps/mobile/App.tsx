import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ExampleFlowScreen } from '@/screens/ExampleFlowScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { MeaningGateScreen } from '@/screens/MeaningGateScreen';
import { MeaningScreen } from '@/screens/MeaningScreen';
import { ReviewFlowScreen } from '@/screens/ReviewFlowScreen';
import { SearchHistoryScreen } from '@/screens/SearchHistoryScreen';
import type { LearningBundle } from '@/types/learning';
import '@/global.css';

type RootStackParamList = {
  Home: undefined;
  MeaningGate: {
    rawInput: string;
  };
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
                isSearching={false}
                onSearchPress={(rawQuery) =>
                  navigation.navigate('MeaningGate', { rawInput: rawQuery })
                }
                onReviewPress={() => navigation.navigate('SearchHistory')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="MeaningGate">
            {({ navigation, route }) => (
              <MeaningGateScreen
                rawInput={route.params.rawInput}
                onClose={() => navigation.popToTop()}
                onResolved={(expression, bundle) =>
                  navigation.replace('ExampleFlow', {
                    expression,
                    bundle,
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
