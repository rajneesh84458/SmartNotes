import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  RefreshControl,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  FadeIn,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import NoteCard from '../components/NoteCard';
import AnimatedHeader from '../components/AnimatedHeader';
import useNoteStore from '../store/useNoteStore';
import { useTheme } from '../theme/ThemeContext';

const HomeScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const {
    deleteNote,
    togglePin,
    searchQuery,
    setSearchQuery,
    getFilteredNotes,
  } = useNoteStore();

  const [refreshing, setRefreshing] = React.useState(false);
  const scrollY = useSharedValue(0);

  const onRefresh = useCallback(async () => {
    setRefreshing(false);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const filteredNotes = getFilteredNotes();

  const renderNote = ({ item, index }) => (
    <NoteCard
      note={item}
      index={index}
      onPress={() => navigation.navigate('NoteDetail', { note: item })}
      onDelete={() => deleteNote(item.id)}
      onPin={() => togglePin(item.id)}
    />
  );

  const renderEmpty = () => (
    <Animated.View entering={FadeIn.delay(500)} style={styles.emptyContainer}>
      <Icon
        name="document-text-outline"
        size={80}
        color={theme.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No Notes Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Tap the + button to create your first note
      </Text>
    </Animated.View>
  );

  // ────────── Search Bar Component (passed to AnimatedHeader) ──────────
  const SearchBarComponent = (
    <Animated.View
      entering={FadeIn.delay(300)}
      style={[styles.searchContainer, { backgroundColor: theme.card }]}
    >
      <Icon name="search-outline" size={20} color={theme.textSecondary} />
      <TextInput
        style={[styles.searchInput, { color: theme.text }]}
        placeholder="Search notes..."
        placeholderTextColor={theme.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <Icon
          name="close-circle"
          size={20}
          color={theme.textSecondary}
          onPress={() => setSearchQuery('')}
        />
      )}
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ────────── Animated Header with Search Bar ────────── */}
      <AnimatedHeader
        title="My Notes 📝"
        subtitle={`${filteredNotes.length} notes`}
        icon="document-text"
        scrollY={scrollY}
        searchBar={SearchBarComponent}
      />

      {/* ────────── Notes Grid ────────── */}
      <Animated.FlatList
        data={filteredNotes}
        renderItem={renderNote}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
    // paddingTop: 230, // Increased to account for header + search bar
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default HomeScreen;
