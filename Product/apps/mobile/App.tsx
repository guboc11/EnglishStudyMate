import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ExampleFlowScreen } from '@/screens/ExampleFlowScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { ReviewFlowScreen } from '@/screens/ReviewFlowScreen';
import '@/global.css';

type RootStackParamList = {
  Home: undefined;
  ExampleFlow: undefined;
  ReviewFlow: undefined;
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
                onReviewPress={() => navigation.replace('ReviewFlow')}
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
