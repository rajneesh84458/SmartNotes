import React from 'react';
import { ThemeProvider } from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { NetworkProvider } from './src/context/NetworkContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
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
