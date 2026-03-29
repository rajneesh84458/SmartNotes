import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import useBiometric from '../hooks/useBiometric';
import { useTheme } from '../theme/ThemeContext';

const AuthScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { authenticate, biometricType } = useBiometric();

  const handleAuth = async () => {
    const success = await authenticate();
    if (success) {
      navigation.replace('Main');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Icon name="lock-closed" size={80} color={theme.primary} />
      <Text style={[styles.title, { color: theme.text }]}>Smart Notes 📝</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Authenticate to continue
      </Text>

      <TouchableOpacity
        style={[styles.authButton, { backgroundColor: theme.primary }]}
        onPress={handleAuth}
      >
        <Icon
          name={biometricType === 'FaceID' ? 'scan' : 'finger-print'}
          size={24}
          color="#FFF"
        />
        <Text style={styles.authButtonText}>
          {biometricType === 'FaceID'
            ? 'Unlock with Face ID'
            : 'Unlock with Fingerprint'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 40,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  authButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  skip: {
    marginTop: 20,
    fontSize: 14,
  },
});

export default AuthScreen;
