import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
  Platform,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';
import Config from 'react-native-config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedHeader from '../components/AnimatedHeader';

const AIAssistantScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0); // ✅ track keyboard height
  const flatListRef = useRef(null);

  //  Manually listen to keyboard events — works reliably on both iOS & Android
  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Config.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              ...messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text,
              })),
              { role: 'user', content: inputText },
            ],
            max_tokens: 500,
          }),
        },
      );

      const data = await response.json();

      if (data.choices?.[0]?.message) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          text: data.choices[0].message.content,
          sender: 'assistant',
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('AI Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user' && styles.userMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor:
              item.sender === 'user' ? theme.primary : theme.card,
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: item.sender === 'user' ? '#fff' : theme.text },
          ]}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      {/* AnimatedHeader with back button */}
      <AnimatedHeader
        title="AI Assistant"
        // subtitle="Ask anything"
        showBackIcon={true}
      />
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="chatbubbles" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Start a conversation with AI
            </Text>
          </View>
        }
      />

      <View
        style={[
          styles.inputContainer,
          {
            borderTopColor: theme.border,
            paddingBottom: keyboardHeight > 0 ? 8 : insets.bottom + 8,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Ask something..."
          placeholderTextColor={theme.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxHeight={100}
          editable={!loading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: loading ? theme.textSecondary : theme.primary,
            },
          ]}
          onPress={handleSendMessage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size={20} />
          ) : (
            <Icon name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
});

export default AIAssistantScreen;
