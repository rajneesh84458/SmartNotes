import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notesData from '../notes.json';

const useNoteStore = create(
  persist(
    (set, get) => ({
      notes: notesData,
      searchQuery: '',

      // Add new note
      addNote: note => {
        const newNote = {
          id: Date.now().toString(),
          title: note.title,
          content: note.content,
          category: note.category || 'General',
          color: note.color || '#6C5CE7',
          isPinned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          documents: note.documents || [], // ✅ important
        };

        set({ notes: [newNote, ...get().notes] });
      },

      // Add document to note
      addDocument: (noteId, document) => {
        const docWithId = {
          id: Date.now().toString(),
          ...document,
        };

        const updatedNotes = get().notes.map(note =>
          note.id === noteId
            ? {
                ...note,
                documents: [...(note.documents || []), docWithId],
                updatedAt: new Date().toISOString(),
              }
            : note,
        );

        set({ notes: updatedNotes });
      },

      // Remove document
      removeDocument: (noteId, documentId) => {
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
      },

      // Delete note
      deleteNote: id => {
        set({ notes: get().notes.filter(note => note.id !== id) });
      },

      // Toggle pin
      togglePin: id => {
        const updated = get().notes.map(note =>
          note.id === id ? { ...note, isPinned: !note.isPinned } : note,
        );
        set({ notes: updated });
      },

      // Update note
      updateNote: (id, updates) => {
        const updatedNotes = get().notes.map(note =>
          note.id === id
            ? { ...note, ...updates, updatedAt: new Date().toISOString() }
            : note,
        );
        set({ notes: updatedNotes });
      },

      // Search
      setSearchQuery: query => set({ searchQuery: query }),

      getFilteredNotes: () => {
        const { notes, searchQuery } = get();
        const filtered = notes.filter(
          note =>
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        return filtered.sort((a, b) => b.isPinned - a.isPinned);
      },
    }),
    {
      name: 'notes-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useNoteStore;
