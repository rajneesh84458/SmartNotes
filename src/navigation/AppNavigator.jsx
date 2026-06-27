import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NoteDetailScreen from '../screens/NoteDetailScreen';
import AuthScreen from '../screens/AuthScreen';
import { useTheme } from '../theme/ThemeContext';
import VoiceTestScreen from '../screens/VoiceTestScreen';
import SplashScreen from '../screens/SplashScreen';
import PdfViewerScreen from '../screens/PdfViewerScreen';
import { StatusBar } from 'react-native';
import AIAssistantScreen from '../screens/AIAssistant';
import NetworkBanner from '../components/NetworkBanner';
import { useNetwork } from '../context/NetworkContext';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { theme } = useTheme();
  const { isConnected } = useNetwork();
  return (
    <>
      <NavigationContainer>
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
            options={{
              headerShown: true,
              title: 'Note',
              headerBackTitleVisible: false,
              headerStyle: { backgroundColor: theme.background, fontSize: 14 },
            }}
          />
          <Stack.Screen
            name="PdfViewer"
            component={PdfViewerScreen}
            options={{
              headerShown: true,
              title: 'View File',
              headerBackTitleVisible: false,
              headerStyle: { backgroundColor: theme.background, fontSize: 14 },
            }}
          />
          <Stack.Screen
            name="AIAssistant"
            component={AIAssistantScreen}
            options={{
              headerShown: false,
              title: 'Your AI Assistant',
              headerTitleStyle: { fontSize: 16 },
              headerStyle: { backgroundColor: theme.background, fontSize: 12 },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <NetworkBanner isConnected={isConnected} />
    </>
  );
};

export default AppNavigator;
