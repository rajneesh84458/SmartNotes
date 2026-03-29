import { useState, useEffect } from 'react';
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

const useBiometric = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [biometricType, setBiometricType] = useState(null);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    if (available) {
      setBiometricType(biometryType);
    }
  };

  const authenticate = async () => {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Authenticate to access Smart Notes',
        cancelButtonText: 'Cancel',
      });

      if (success) {
        console.log('success ----', success);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.log('Biometric error:', error);
      return false;
    }
  };

  return { isAuthenticated, biometricType, authenticate };
};

export default useBiometric;
