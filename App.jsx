import React, { useEffect } from 'react';
import { ThemeProvider } from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { NetworkProvider } from './src/context/NetworkContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppsAirPush from 'appsairpush-react-native';
import Config from 'react-native-config';

const App = () => {
  useEffect(() => {
    AppsAirPush.sync({
      appId: Config.APPS_AIRPUSH_APP_ID,
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
