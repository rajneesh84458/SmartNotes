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
    <View style={styles.container}>
      <Image
        source={require('../assets/appIcon.png')}
        resizeMode="contain"
        style={styles.ImgContainer}
      />
      <Text style={styles.text}>Engage with your Notes Smartly...</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  ImgContainer: {
    width: '100%',
    height: '50%',
  },
  text: {
    position: 'absolute',
    // top: 0,
    bottom: 20,
    right: 0,
    left: 0,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
