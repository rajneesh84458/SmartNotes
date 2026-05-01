import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import NoteDetailScreen from '../screens/NoteDetailScreen';
import AuthScreen from '../screens/AuthScreen';
import { useTheme } from '../theme/ThemeContext';
import VoiceTestScreen from '../screens/VoiceTestScreen';
import SplashScreen from '../screens/SplashScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import PdfViewerScreen from '../screens/PdfViewerScreen';
import { StatusBar } from 'react-native';
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content" // ya "dark-content" depending on UI
      />
      <NavigationContainer>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: theme.background },
              headerTintColor: theme.text,
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Auth"
              component={AuthScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="VoiceTest"
              component={VoiceTestScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Main"
              component={BottomTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="NoteDetail"
              component={NoteDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PdfViewer"
              component={PdfViewerScreen}
              // options={{ title: 'Document Viewer' }}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </>
  );
};

export default AppNavigator;
