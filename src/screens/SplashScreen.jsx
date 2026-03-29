import { Image, View, StyleSheet, Text } from 'react-native';
import React, { useEffect } from 'react';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkAuth = async () => {
      setTimeout(() => {
        navigation.replace('Auth');
      }, 2000);
    };
    checkAuth();
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Image
        source={require('../assets/playstore.png')}
        resizeMode="contain"
        style={styles.containerr}
      />
      <Text style={{ fontSize: 16, textAlign: 'center' }}>
        Engage with your Notes Smartly...
      </Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  containerr: {
    width: '100%',
    height: '90%',
  },
});
