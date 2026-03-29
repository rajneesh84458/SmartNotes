import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  FadeIn,
  SlideInUp
} from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeContext';

const HEADER_MAX_HEIGHT = 220;
const HEADER_MIN_HEIGHT = 110;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const AnimatedHeader = ({ title, subtitle, icon, scrollY, searchBar }) => {
  const { theme } = useTheme();

  // ────────── Header container shrinks ──────────
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolation.CLAMP
    );
    return { height };
  });

  // ────────── Title shrinks 32 → 18 ──────────
  const titleAnimatedStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [32, 18],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [0, -20],
      Extrapolation.CLAMP
    );
    return {
      fontSize,
      transform: [{ translateY }],
    };
  });

  // ────────── Subtitle fades out ──────────
  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE * 0.3],
      [1, 0],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [0, -10],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });



  // ────────── Decorative dots fade out ──────────
  const dotsAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE * 0.3],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // ────────── Search bar slides up into header ──────────
  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [0, -60],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE * 0.3, HEADER_SCROLL_DISTANCE],
      [1, 1, 1],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  // ────────── Bottom border appears on scroll ──────────
  const borderAnimatedStyle = useAnimatedStyle(() => {
    const borderOpacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      borderBottomWidth: 1,
      borderBottomColor: `rgba(150, 150, 150, ${borderOpacity * 0.3})`,
    };
  });

  return (
    <Animated.View
      style={[
        styles.header,
        headerAnimatedStyle,
        borderAnimatedStyle,
        { backgroundColor: theme.background },
      ]}>
      <View style={styles.headerContent}>

        {/* Title */}
        <Animated.Text
          entering={SlideInUp.delay(100).springify()}
          style={[styles.title, titleAnimatedStyle, { color: theme.text }]}>
          {title}
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeIn.delay(400).duration(600)}
          style={[
            styles.subtitle,
            subtitleAnimatedStyle,
            { color: theme.textSecondary },
          ]}>
          {subtitle}
        </Animated.Text>

        {/* Decorative dots */}
        <Animated.View style={[styles.decorativeDots, dotsAnimatedStyle]}>
          <View style={[styles.dot, { backgroundColor: theme.primary }]} />
          <View style={[styles.dot, { backgroundColor: theme.accent }]} />
          <View style={[styles.dot, { backgroundColor: '#FF6B6B' }]} />
        </Animated.View>
      </View>

      {/* ────────── Search Bar (slides into header on scroll) ────────── */}
      {searchBar && (
        <Animated.View style={[styles.searchBarWrapper, searchBarAnimatedStyle]}>
          {searchBar}
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  iconWrapper: {
    marginBottom: 8,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  decorativeDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  searchBarWrapper: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
});

export default AnimatedHeader;