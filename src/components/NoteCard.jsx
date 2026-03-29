// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { useTheme } from '../theme/ThemeContext';

// const { width } = Dimensions.get('window');
// const CARD_WIDTH = (width - 48) / 2;

// const NoteCard = ({ note, onPress, onDelete, onPin }) => {
//   console.log("note----",note)
//   const { theme } = useTheme();

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       activeOpacity={0.7}
//       style={[
//         styles.card,
//         {
//           backgroundColor: theme.card,
//           borderLeftColor: note.color,
//           borderLeftWidth: 4,
//         },
//       ]}>
//       {/* Pin Icon */}
//       <TouchableOpacity onPress={onPin} style={styles.pinButton}>
//         <Icon
//           name={note.isPinned ? 'bookmark' : 'bookmark-outline'}
//           size={18}
//           color={note.isPinned ? '#FFD93D' : theme.textSecondary}
//         />
//       </TouchableOpacity>

//       {/* Title */}
//       <Text
//         style={[styles.title, { color: theme.text }]}
//         numberOfLines={2}>
//         {note.title}
//       </Text>

//       {/* Content Preview */}
//       <Text
//         style={[styles.content, { color: theme.textSecondary }]}
//         numberOfLines={3}>
//         {note.content}
//       </Text>

//       {/* Footer */}
//       <View style={styles.footer}>
//         <Text style={[styles.date, { color: theme.textSecondary }]}>
//           {formatDate(note.createdAt)}
//         </Text>
//         <View style={[styles.category, { backgroundColor: note.color + '20' }]}>
//           <Text style={[styles.categoryText, { color: note.color }]}>
//             {note.category}
//           </Text>
//         </View>
//       </View>

//       {/* Delete */}
//       <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
//         <Icon name="trash-outline" size={16} color={theme.danger} />
//       </TouchableOpacity>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     width: CARD_WIDTH,
//     padding: 16,
//     borderRadius: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   pinButton: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: '700',
//     marginBottom: 8,
//     marginRight: 24,
//   },
//   content: {
//     fontSize: 13,
//     lineHeight: 18,
//     marginBottom: 12,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   date: {
//     fontSize: 11,
//   },
//   category: {
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 8,
//   },
//   categoryText: {
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   deleteButton: {
//     position: 'absolute',
//     bottom: 12,
//     right: 12,
//   },
// });

// export default NoteCard;



import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  ZoomIn,
  Layout,
} from 'react-native-reanimated';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';


const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const NoteCard = ({ note, index, onPress, onDelete, onPin }) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
    // Light haptic on press
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    onPress();
  };

  const handlePin = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
    onPin();
  };

  const handleDelete = () => {
    ReactNativeHapticFeedback.trigger('notificationWarning', hapticOptions);
    onDelete();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)
        .springify()
        .damping(14)
        .stiffness(100)}
      exiting={FadeOutUp.springify()}
      layout={Layout.springify()}>
      <AnimatedTouchable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={[
          styles.card,
          animatedCardStyle,
          {
            backgroundColor: theme.card,
            borderLeftColor: note.color,
            borderLeftWidth: 4,
          },
        ]}>
        {/* Pin */}
        <TouchableOpacity onPress={handlePin} style={styles.pinButton}>
          <Animated.View entering={ZoomIn.delay(index * 100 + 200)}>
            <Icon
              name={note.isPinned ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={note.isPinned ? '#FFD93D' : theme.textSecondary}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Title */}
        <Text
          style={[styles.title, { color: theme.text }]}
          numberOfLines={2}>
          {note.title}
        </Text>

        {/* Content */}
        <Text
          style={[styles.content, { color: theme.textSecondary }]}
          numberOfLines={3}>
          {note.content}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.date, { color: theme.textSecondary }]}>
            {formatDate(note.createdAt)}
          </Text>
          <View style={[styles.category, { backgroundColor: note.color + '20' }]}>
            <Text style={[styles.categoryText, { color: note.color }]}>
              {note.category}
            </Text>
          </View>
        </View>

        {/* Delete */}
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Icon name="trash-outline" size={16} color={theme.danger} />
        </TouchableOpacity>
      </AnimatedTouchable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  pinButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    marginRight: 24,
  },
  content: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 11,
  },
  category: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 5,
    right: 10,
    marginTop:10
  },
});

export default NoteCard;