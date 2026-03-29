import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import RNFS from 'react-native-fs';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Icon from 'react-native-vector-icons/Ionicons';
import useNoteStore from '../store/useNoteStore';
import { useTheme } from '../theme/ThemeContext';
import AnimatedHeader from '../components/AnimatedHeader';
import useVoiceToText from '../hooks/useVoiceToText';
import {
  pick,
  keepLocalCopy,
  types as docTypes,
  isCancel,
} from '@react-native-documents/picker';
import { viewDocument } from '@react-native-documents/viewer';

const COLORS = [
  '#6C5CE7',
  '#00CECE',
  '#FF6B6B',
  '#FDCB6E',
  '#00B894',
  '#E17055',
];
const CATEGORIES = ['General', 'Work', 'Personal', 'Ideas', 'Todo', 'Learning'];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const CreateNoteScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const addNote = useNoteStore(state => state.addNote);
  const scrollY = useSharedValue(0);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  // Document Picker Handler
  // const handlePickDocument = async () => {
  //   try {
  //     setDocLoading(true);
  //     const res = await pick({
  //       allowMultiSelection: true,
  //     });
  //     setDocuments(prev => [...prev, ...res]);
  //   } catch (err) {
  //     if (isCancel && isCancel(err)) return;
  //     Alert.alert('Error', 'Failed to pick document');
  //   } finally {
  //     setDocLoading(false);
  //   }
  // };
  const handlePickDocument = async () => {
    try {
      setDocLoading(true);

      const res = await pick({
        allowMultiSelection: true,
      });

      const tempDocs = res.map(doc => ({
        uri: doc.uri, // keep uri for preview
        name: doc.name,
        type: doc.type,
        isTemp: true, // mark as temporary
      }));

      setDocuments(prev => [...prev, ...tempDocs]);
    } catch (err) {
      if (isCancel && isCancel(err)) return;
      Alert.alert('Error', 'Failed to pick document');
    } finally {
      setDocLoading(false);
    }
  };

  // Document Viewer Handler
  const handleViewDocument = async doc => {
    try {
      // viewDocument expects an object, not just a URI string
      await viewDocument({ uri: doc.uri, name: doc.name, type: doc.type });
    } catch (err) {
      Alert.alert('Error', 'Cannot open document');
    }
  };

  // Track which field is being voice-filled
  const [activeVoiceField, setActiveVoiceField] = useState(null); // 'title' | 'content' | null

  const {
    isListening,
    partialText,
    error: voiceError,
    startListening,
    stopListening,
    isAvailable: voiceAvailable,
  } = useVoiceToText();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleColorSelect = color => {
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    setSelectedColor(color);
  };

  const handleCategorySelect = cat => {
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    setSelectedCategory(cat);
  };

  // ────────── Voice Input Handler ──────────

  const handleVoiceInput = useCallback(
    async field => {
      // If already listening for this field, stop
      if (isListening && activeVoiceField === field) {
        ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
        await stopListening();
        setActiveVoiceField(null);
        return;
      }

      // If listening for another field, stop first
      if (isListening) {
        await stopListening();
        // Wait for cleanup
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
      setActiveVoiceField(field);

      await startListening({
        continuous: field === 'content', // Title = single, Content = continuous
        onResult: text => {
          console.log(`📝 Setting ${field}:`, text);
          if (field === 'title') {
            setTitle(text);
            // Auto-stop after getting title
            setTimeout(() => {
              setActiveVoiceField(null);
            }, 300);
          } else if (field === 'content') {
            setContent(text);
          }
        },
      });
    },
    [isListening, activeVoiceField, startListening, stopListening],
  );

  const handleSave = async () => {
    if (isListening) {
      await stopListening();
      setActiveVoiceField(null);
    }

    if (!title.trim()) {
      ReactNativeHapticFeedback.trigger('notificationError', hapticOptions);
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!content.trim()) {
      ReactNativeHapticFeedback.trigger('notificationError', hapticOptions);
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    try {
      const savedDocs = [];

      for (const doc of documents) {
        const destPath = `${RNFS.DocumentDirectoryPath}/${Date.now()}_${
          doc.name
        }`;

        console.log('Copying:', doc.uri, '→', destPath);

        await RNFS.copyFile(doc.uri, destPath);

        savedDocs.push({
          id: Date.now().toString() + Math.random(),
          name: doc.name,
          type: doc.type,
          uri: destPath,
        });
      }

      await addNote({
        title: title.trim(),
        content: content.trim(),
        color: selectedColor,
        category: selectedCategory,
        documents: savedDocs, // ✅ only permanent URIs stored
      });

      ReactNativeHapticFeedback.trigger('notificationSuccess', hapticOptions);

      setTitle('');
      setContent('');
      setDocuments([]);

      navigation.goBack(); // go to Home as you want
    } catch (err) {
      console.log('Save error:', err);
      Alert.alert('Error', 'Failed to save note');
    }
  };
  // ────────── Voice Button Component ──────────

  const VoiceButton = ({ field }) => {
    const isActive = isListening && activeVoiceField === field;

    return (
      <TouchableOpacity
        onPress={() => handleVoiceInput(field)}
        style={[
          styles.voiceButton,
          {
            backgroundColor: isActive ? '#FF6B6B' : theme.primary + '20',
            borderColor: isActive ? '#FF6B6B' : theme.primary,
          },
        ]}
        activeOpacity={0.7}
        disabled={!voiceAvailable}
      >
        {isActive ? (
          <View style={styles.voiceActiveRow}>
            <ActivityIndicator size="small" color="#FFF" />
            <Icon name="stop" size={16} color="#FFF" />
          </View>
        ) : (
          <Icon
            name="mic"
            size={20}
            color={voiceAvailable ? theme.primary : '#888'}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Animated Header */}
      <AnimatedHeader
        title="Create Note ✍️"
        subtitle="Write down your thoughts"
        icon="create"
        scrollY={scrollY}
      />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Voice Error */}
        {voiceError && (
          <View style={styles.voiceErrorCard}>
            <Icon name="warning" size={16} color="#FF6B6B" />
            <Text style={styles.voiceErrorText}>{voiceError}</Text>
          </View>
        )}

        {/* Title Input with Voice */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: theme.text }]}>Title</Text>
            {isListening && activeVoiceField === 'title' && (
              <Text style={styles.listeningBadge}>🎙️ Listening...</Text>
            )}
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.titleInput,
                {
                  color: theme.text,
                  borderColor:
                    isListening && activeVoiceField === 'title'
                      ? '#FF6B6B'
                      : theme.border,
                  backgroundColor: theme.card,
                },
              ]}
              placeholder="Note title..."
              placeholderTextColor={theme.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
            <VoiceButton field="title" />
          </View>

          {/* Show partial text for title */}
          {isListening && activeVoiceField === 'title' && partialText ? (
            <Text style={[styles.partialPreview, { color: theme.primary }]}>
              {partialText}
            </Text>
          ) : null}
        </Animated.View>

        {/* Content Input with Voice */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: theme.text }]}>Content</Text>
            {isListening && activeVoiceField === 'content' && (
              <Text style={styles.listeningBadge}>🎙️ Listening...</Text>
            )}
          </View>
          <View style={styles.contentInputWrapper}>
            <TextInput
              style={[
                styles.contentInput,
                {
                  color: theme.text,
                  borderColor:
                    isListening && activeVoiceField === 'content'
                      ? '#FF6B6B'
                      : theme.border,
                  backgroundColor: theme.card,
                },
              ]}
              placeholder="Write your note here..."
              placeholderTextColor={theme.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.contentVoiceButton}>
              <VoiceButton field="content" />
            </View>
          </View>

          {/* Show partial text for content */}
          {isListening && activeVoiceField === 'content' && partialText ? (
            <Text style={[styles.partialPreview, { color: theme.primary }]}>
              {partialText}
            </Text>
          ) : null}
        </Animated.View>

        {/* Color Picker */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text style={[styles.label, { color: theme.text }]}>Color</Text>
          <View style={styles.colorRow}>
            {COLORS.map((color, index) => (
              <Animated.View
                key={color}
                entering={ZoomIn.delay(400 + index * 80).springify()}
              >
                <TouchableOpacity
                  onPress={() => handleColorSelect(color)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSelected,
                  ]}
                >
                  {selectedColor === color && (
                    <Icon name="checkmark" size={16} color="#FFF" />
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Category Picker */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <Text style={[styles.label, { color: theme.text }]}>Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat, index) => (
              <Animated.View
                key={cat}
                entering={FadeInDown.delay(500 + index * 60).springify()}
              >
                <TouchableOpacity
                  onPress={() => handleCategorySelect(cat)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor:
                        selectedCategory === cat ? theme.primary : theme.card,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: selectedCategory === cat ? '#FFF' : theme.text,
                      fontWeight: '600',
                      fontSize: 13,
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Document Picker */}
        <Animated.View entering={FadeInDown.delay(350).springify()}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handlePickDocument}
            activeOpacity={0.8}
          >
            <Icon name="attach" size={20} color={theme.primary} />
            <Text
              style={{ color: theme.primary, fontWeight: '600', fontSize: 15 }}
            >
              Attach Note
            </Text>
            {docLoading && (
              <ActivityIndicator
                size="small"
                color={theme.primary}
                style={{ marginLeft: 8 }}
              />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Attached Notes List */}
        {documents.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(360).springify()}
            style={styles.documentList}
          >
            <Text
              style={[styles.label, { color: theme.text, marginBottom: 6 }]}
            >
              Attached Notes
            </Text>
            <FlatList
              data={documents}
              keyExtractor={item => item.uri}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.documentItem}
                  onPress={() => handleViewDocument(item)}
                  activeOpacity={0.7}
                >
                  <Icon name="document" size={18} color={theme.primary} />
                  <Text
                    style={{ color: theme.text, fontSize: 14, flex: 1 }}
                    numberOfLines={1}
                  >
                    {item.name || item.uri.split('/').pop()}
                  </Text>
                  <Icon name="eye" size={18} color={theme.primary} />
                </TouchableOpacity>
              )}
              style={{ marginBottom: 16 }}
              scrollEnabled={false}
            />
          </Animated.View>
        )}
        {/* Save Button */}
        <AnimatedTouchable
          entering={FadeInUp.delay(600).springify()}
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Icon name="checkmark-circle" size={22} color="#FFF" />
          <Text style={styles.saveButtonText}>Save Note</Text>
        </AnimatedTouchable>
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // ────────── Document Picker ──────────
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#6C5CE7',
    marginBottom: 16,
    backgroundColor: '#F5F6FA',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  documentList: {
    marginBottom: 16,
    backgroundColor: '#F5F6FA',
    borderRadius: 10,
    padding: 8,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 230,
    paddingBottom: 40,
  },
  // ────────── Voice Error ──────────
  voiceErrorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B15',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  voiceErrorText: {
    color: '#FF6B6B',
    fontSize: 13,
    flex: 1,
  },
  // ────────── Label Row ──────────
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 10,
  },
  listeningBadge: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  // ────────── Input with Voice Button ──────────
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  contentInputWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  contentInput: {
    fontSize: 16,
    minHeight: 180,
    padding: 16,
    paddingRight: 56,
    borderRadius: 12,
    borderWidth: 1,
    lineHeight: 24,
  },
  contentVoiceButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  // ────────── Voice Button ──────────
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // ────────── Partial Preview ──────────
  partialPreview: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  // ────────── Colors ──────────
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  // ────────── Categories ──────────
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  // ────────── Save ──────────
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default CreateNoteScreen;
