import React, { useEffect } from 'react';
import { ThemeProvider } from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { NetworkProvider } from './src/context/NetworkContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CodePush from '@code-push-next/react-native-code-push';

const App = () => {
  useEffect(() => {
    CodePush.sync({
      installMode: CodePush.InstallMode.IMMEDIATE,
      updateDialog: true,
    });
  }, []);
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NetworkProvider>
          <AppNavigator />
        </NetworkProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
