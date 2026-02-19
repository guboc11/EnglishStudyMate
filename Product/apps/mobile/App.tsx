import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ExampleFlowScreen } from '@/screens/ExampleFlowScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { Review1Screen } from '@/screens/Review1Screen';
import '@/global.css';

type RootStackParamList = {
  Home: undefined;
  ExampleFlow: undefined;
  Review1: undefined;
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
              <HomeScreen onSearchPress={() => navigation.navigate('ExampleFlow')} />
            )}
          </Stack.Screen>
          <Stack.Screen name="ExampleFlow">
            {({ navigation }) => (
              <ExampleFlowScreen
                onClose={() => navigation.popToTop()}
                onReviewPress={() => navigation.navigate('Review1')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Review1">
            {({ navigation }) => (
              <Review1Screen onClose={() => navigation.popToTop()} />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </GluestackUIProvider>
  );
}
