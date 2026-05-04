import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

const NetworkContext = createContext({
  isConnected: true,
});

export const NetworkProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = !!state.isConnected;
      setIsConnected(connected);
      if (connected) {
        console.log('Back Online');
      } else {
        console.log('No Internet Connection');
      }
    });

    return unsubscribe;
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
};

// custom hook (clean usage)
export const useNetwork = () => useContext(NetworkContext);
