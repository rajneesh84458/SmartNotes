import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const NetworkBanner = ({ isConnected }) => {
  const [visible, setVisible] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const slide = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (!isConnected) {
      setVisible(true);
      setWasOffline(true);

      Animated.timing(slide, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else if (isConnected && wasOffline) {
      setVisible(true);

      Animated.timing(slide, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(slide, {
          toValue: 50,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
          setWasOffline(false);
        });
      }, 2000);
    }
  }, [isConnected]);

  if (!visible) return null;

  const isOnlineNow = isConnected && wasOffline;

  return (
    <Animated.View style={{ transform: [{ translateY: slide }] }}>
      <View
        style={[
          styles.banner,
          { backgroundColor: isOnlineNow ? '#34C759' : '#FF3B30' },
        ]}
      >
        <Text style={styles.text}>
          {isOnlineNow ? 'Back online' : 'No internet connection'}
        </Text>
      </View>
    </Animated.View>
  );
};

export default NetworkBanner;

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 8,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
  },
});
