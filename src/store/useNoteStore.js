import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notesData from '../notes.json';
const useNoteStore = create((set, get) => ({
  notes: [],
  searchQuery: '',

  // Load notes from storage
  loadNotes: async () => {
    try {
      const saved = await AsyncStorage.getItem('notes');
      if (saved) {
        set({ notes: JSON.parse(saved) });
      } else {
        set({ notes: notesData });
      }
    } catch (error) {
      console.log('Error loading notes:', error);
    }
  },

  // Add new note
  addNote: async note => {
    const newNote = {
      id: Date.now().toString(),
      title: note.title,
      content: note.content,
      category: note.category || 'General',
      color: note.color || '#6C5CE7',
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: Array.isArray(note.documents) ? note.documents : [],
    };

    const updatedNotes = [newNote, ...get().notes];
    set({ notes: updatedNotes });
    await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
  },

  // Add document to note
  addDocument: async (noteId, document) => {
    const updatedNotes = get().notes.map(note =>
      note.id === noteId
        ? {
            ...note,
            documents: [...(note.documents || []), document],
            updatedAt: new Date().toISOString(),
          }
        : note,
    );
    set({ notes: updatedNotes });
    await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
  },

  // Remove document from note
  removeDocument: async (noteId, documentId) => {
    const updatedNotes = get().notes.map(note =>
      note.id === noteId
        ? {
            ...note,
            documents: (note.documents || []).filter(
              doc => doc.id !== documentId,
            ),
            updatedAt: new Date().toISOString(),
          }
        : note,
    );
    set({ notes: updatedNotes });
    await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
  },

  // Delete note
  deleteNote: async id => {
    const updatedNotes = get().notes.filter(note => note.id !== id);
    set({ notes: updatedNotes });
    await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
  },

  // Toggle pin
  togglePin: async id => {
    const updatedNotes = get().notes.map(note =>
      note.id === id ? { ...note, isPinned: !note.isPinned } : note,
    );
    set({ notes: updatedNotes });
    await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
  },

  // Update note
  updateNote: async (id, updates) => {
    const updatedNotes = get().notes.map(note =>
      note.id === id
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note,
    );
    set({ notes: updatedNotes });
    await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
  },

  // Search
  setSearchQuery: query => set({ searchQuery: query }),

  // Get filtered notes
  getFilteredNotes: () => {
    const { notes, searchQuery } = get();
    const filtered = notes.filter(
      note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    // Pinned notes first
    return filtered.sort((a, b) => b.isPinned - a.isPinned);
  },
}));

export default useNoteStore;
