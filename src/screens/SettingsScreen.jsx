// import React from 'react';
// import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { useTheme } from '../theme/ThemeContext';
// import useNoteStore from '../store/useNoteStore';

// const SettingsScreen = () => {
//   const { theme, isDark, toggleTheme } = useTheme();
//   const notes = useNoteStore((state) => state.notes);

//   const settingsItems = [
//     {
//       icon: isDark ? 'moon' : 'sunny',
//       title: 'Dark Mode',
//       subtitle: isDark ? 'On' : 'Off',
//       action: () => toggleTheme(),
//       isSwitch: true,
//     },
//     {
//       icon: 'document-text',
//       title: 'Total Notes',
//       subtitle: `${notes.length} notes`,
//     },
//     {
//       icon: 'bookmark',
//       title: 'Pinned Notes',
//       subtitle: `${notes.filter((n) => n.isPinned).length} pinned`,
//     },
//     {
//       icon: 'information-circle',
//       title: 'App Version',
//       subtitle: '1.0.0',
//     },
//   ];

//   return (
//     <View style={[styles.container, { backgroundColor: theme.background }]}>
//       <Text style={[styles.header, { color: theme.text }]}>Settings ⚙️</Text>

//       {settingsItems.map((item, index) => (
//         <TouchableOpacity
//           key={index}
//           style={[styles.settingItem, { backgroundColor: theme.card }]}
//           onPress={item.action}
//           activeOpacity={item.action ? 0.7 : 1}>
//           <View style={styles.settingLeft}>
//             <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
//               <Icon name={item.icon} size={22} color={theme.primary} />
//             </View>
//             <View>
//               <Text style={[styles.settingTitle, { color: theme.text }]}>
//                 {item.title}
//               </Text>
//               <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
//                 {item.subtitle}
//               </Text>
//             </View>
//           </View>

//           {item.isSwitch && (
//             <Switch
//               value={isDark}
//               onValueChange={toggleTheme}
//               trackColor={{ false: '#ccc', true: theme.primary }}
//               thumbColor="#FFF"
//             />
//           )}
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: 60,
//     paddingHorizontal: 20,
//   },
//   header: {
//     fontSize: 28,
//     fontWeight: '800',
//     marginBottom: 24,
//   },
//   settingItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     borderRadius: 16,
//     marginBottom: 12,
//   },
//   settingLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 16,
//   },
//   iconContainer: {
//     width: 44,
//     height: 44,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   settingTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   settingSubtitle: {
//     fontSize: 13,
//     marginTop: 2,
//   },
// });

// export default SettingsScreen;


import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
} from 'react-native-reanimated';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';
import useNoteStore from '../store/useNoteStore';
import AnimatedHeader from '../components/AnimatedHeader';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const SettingsScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const notes = useNoteStore((state) => state.notes);
  const scrollY = useSharedValue(0);

  const handleToggleTheme = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    toggleTheme();
  };

  const settingsItems = [
    {
      icon: isDark ? 'moon' : 'sunny',
      title: 'Dark Mode',
      subtitle: isDark ? 'On' : 'Off',
      action: handleToggleTheme,
      isSwitch: true,
    },
    {
      icon: 'document-text',
      title: 'Total Notes',
      subtitle: `${notes.length} notes`,
    },
    {
      icon: 'bookmark',
      title: 'Pinned Notes',
      subtitle: `${notes.filter((n) => n.isPinned).length} pinned`,
    },
    {
      icon: 'information-circle',
      title: 'App Version',
      subtitle: '1.0.0',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Animated Header */}
      <AnimatedHeader
        title="Settings ⚙️"
        subtitle="Customize your experience"
        icon="settings"
        scrollY={scrollY}
      />

      <View style={styles.content}>
        {settingsItems.map((item, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(index * 100).springify()}>
            <TouchableOpacity
              style={[styles.settingItem, { backgroundColor: theme.card }]}
              onPress={() => {
                if (item.action) {
                  item.action();
                } else {
                  ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
                }
              }}
              activeOpacity={item.action ? 0.7 : 1}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.primary + '20' },
                  ]}>
                  <Icon name={item.icon} size={22} color={theme.primary} />
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: theme.text }]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.settingSubtitle,
                      { color: theme.textSecondary },
                    ]}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>

              {item.isSwitch && (
                <Switch
                  value={isDark}
                  onValueChange={handleToggleTheme}
                  trackColor={{ false: '#ccc', true: theme.primary }}
                  thumbColor="#FFF"
                />
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 210,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});

export default SettingsScreen;