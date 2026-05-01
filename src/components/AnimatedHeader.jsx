import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const AnimatedHeader = ({
  title,
  subtitle,
  searchBar,
  showBackIcon = false,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* BACK ICON */}

      <View style={styles.headerContent}>
        <View style={styles.backButton}>
          {showBackIcon && (
            <Pressable onPress={() => navigation.goBack()}>
              <Icon name="chevron-back" size={24} color={theme.text} />
            </Pressable>
          )}
          <View>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* SEARCH BAR */}
      {searchBar && <View style={styles.searchBarContainer}>{searchBar}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    // paddingVertical: 12,
  },
  headerContent: {
    marginVertical: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  content: {
    marginVertical: 8,
  },

  searchBarContainer: {
    marginVertical: 12,
  },
});

export default AnimatedHeader;
