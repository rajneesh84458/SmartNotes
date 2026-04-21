import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEADER_MAX_HEIGHT = 180;
const HEADER_MIN_HEIGHT = 110;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const AnimatedHeader = ({ title, subtitle, scrollY, searchBar }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  /* ───────── HEADER HEIGHT ───────── */
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT + insets.top, HEADER_MIN_HEIGHT + insets.top],
      Extrapolation.CLAMP,
    );

    return { height };
  });

  /* ───────── CONTENT MOVE ───────── */
  const contentAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [30, 0],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY }],
    };
  });

  /* ───────── TITLE SCALE ───────── */
  const titleAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [1.2, 1],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }],
    };
  });

  /* ───────── SUBTITLE FADE ───────── */
  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE * 0.4],
      [1, 0],
      Extrapolation.CLAMP,
    );

    return { opacity };
  });

  /* ───────── SEARCH BAR ANIMATION ───────── */
  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [0, -20],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.header,
        headerAnimatedStyle,
        { backgroundColor: theme.background },
      ]}
    >
      {/* SAFE AREA */}
      <View style={{ height: insets.top }} />

      {/* CONTENT */}
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        <Animated.Text
          style={[styles.title, titleAnimatedStyle, { color: theme.text }]}
        >
          {title}
        </Animated.Text>

        <Animated.Text
          style={[
            styles.subtitle,
            subtitleAnimatedStyle,
            { color: theme.textSecondary },
          ]}
        >
          {subtitle}
        </Animated.Text>
      </Animated.View>

      {/* SEARCH BAR */}
      {searchBar && (
        <Animated.View
          style={[styles.searchBarWrapper, searchBarAnimatedStyle]}
        >
          {searchBar}
        </Animated.View>
      )}
    </Animated.View>
  );
};

export default AnimatedHeader;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },

  content: {
    flex: 1,
    // justifyContent: 'center',
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 28,
  },

  subtitle: {
    fontSize: 14,
    marginTop: 6,
  },

  searchBarWrapper: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
});
