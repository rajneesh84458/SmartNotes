// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Share,
//   Alert,
//   TextInput,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { useTheme } from '../theme/ThemeContext';
// import { viewDocument } from '@react-native-documents/viewer';
// import { pick, isCancel } from '@react-native-documents/picker';
// import useNoteStore from '../store/useNoteStore';
// import { getAISummary } from '../services/aiService';
// import RNFS from 'react-native-fs';
// const NoteDetailScreen = ({ route, navigation }) => {
//   const { note } = route.params;
//   const { theme } = useTheme();
//   const deleteNote = useNoteStore(state => state.deleteNote);
//   const notes = useNoteStore(state => state.notes);
//   const removeDocument = useNoteStore(state => state.removeDocument);
//   const [isEditingTitle, setIsEditingTitle] = useState(false);
//   const [editedTitle, setEditedTitle] = useState(note.title);
//   const updateNote = useNoteStore(state => state.updateNote);

//   const addDocument = useNoteStore(state => state.addDocument);
//   console.log('notes--------', notes, addDocument);

//   const handleEditTitle = async () => {
//     if (editedTitle.trim() === '') {
//       Alert.alert('Error', 'Title cannot be empty');
//       return;
//     }
//     await updateNote(note.id, { title: editedTitle });
//     setIsEditingTitle(false);
//     navigation.setParams({ note: { ...note, title: editedTitle } });
//     Alert.alert('Success', 'Title updated!');
//   };
//   const handleAddDocuments = async () => {
//     try {
//       const res = await pick({ allowMultiSelection: true });
//       if (res && res.length > 0) {
//         const existingUris = Array.isArray(note.documents)
//           ? note.documents.map(d => d.uri)
//           : [];
//         const filtered = res.filter(doc => !existingUris.includes(doc.uri));

//         const newDocs = [];

//         for (const doc of filtered) {
//           const destPath = `${RNFS.DocumentDirectoryPath}/${Date.now()}_${
//             doc.name
//           }`;
//           await RNFS.copyFile(doc.uri, destPath);

//           const newDoc = {
//             id: Date.now().toString() + Math.random(),
//             name: doc.name,
//             type: doc.type,
//             uri: destPath,
//           };

//           await addDocument(note.id, newDoc);
//           newDocs.push(newDoc);
//         }

//         navigation.setParams({
//           note: {
//             ...note,
//             documents: [...(note.documents || []), ...newDocs],
//           },
//         });
//       }
//     } catch (err) {
//       if (isCancel && isCancel(err)) return;
//       Alert.alert('Error', 'Failed to add documents');
//     }
//   };

//   const handleViewDocument = async doc => {
//     try {
//       const fileUri = doc.uri.startsWith('file://')
//         ? doc.uri
//         : `file://${doc.uri}`;

//       console.log('Opening:', fileUri);

//       await viewDocument({
//         uri: fileUri,
//         name: doc.name,
//         type: doc.type,
//       });
//     } catch (err) {
//       console.log('Viewer error:', err);
//       Alert.alert('Error', 'Cannot open document');
//     }
//   };

//   // If note has aiSummary, use it; otherwise, use real-time summary
//   const [summary, setSummary] = useState(note.aiSummary || []);
//   const [loadingSummary, setLoadingSummary] = useState(false);

//   const handleAISummary = async () => {
//     // Only fetch if note doesn't have aiSummary
//     if (!note.aiSummary) {
//       setLoadingSummary(true);
//       const result = await getAISummary(note.content);
//       const points = result
//         .split('\n')
//         .filter(line => line.trim())
//         .map(line => line.replace(/^[-•\d. ]+/, ''));
//       setSummary(points);
//       setLoadingSummary(false);
//     }
//   };

//   const handleShare = async () => {
//     try {
//       await Share.share({
//         title: note.title,
//         message: `${note.title}\n\n${note.content}\n\nDownload the app: https://appdistribution.firebase.dev/i/de87c9a91c1145ce`,
//       });
//     } catch (error) {
//       console.log('Share error:', error);
//     }
//   };

//   const handleDelete = () => {
//     Alert.alert('Delete Note', 'Are you sure?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Delete',
//         style: 'destructive',
//         onPress: async () => {
//           await deleteNote(note.id);
//           navigation.goBack();
//         },
//       },
//     ]);
//   };

//   // // Delete attached document handler
//   const handleDeleteDocument = async docId => {
//     await removeDocument(note.id, docId);

//     const filteredDocs = (note.documents || []).filter(doc => doc.id !== docId);

//     navigation.setParams({ note: { ...note, documents: filteredDocs } });
//     Alert.alert('Deleted', 'Attachment removed.');
//   };
//   const currentTitle = route.params?.note?.title || note.title;
//   return (
//     <ScrollView
//       style={[styles.container, { backgroundColor: theme.background }]}
//       showsVerticalScrollIndicator={false}
//     >
//       <View style={styles.titleContainer}>
//         {isEditingTitle ? (
//           <TextInput
//             style={[
//               styles.titleInput,
//               { color: theme.text, borderColor: theme.primary },
//             ]}
//             value={editedTitle}
//             onChangeText={setEditedTitle}
//             placeholder="Enter title"
//             placeholderTextColor={theme.textSecondary}
//             autoFocus
//           />
//         ) : (
//           <Text style={[styles.title, { color: theme.text }]}>
//             {currentTitle}
//           </Text>
//         )}
//         <TouchableOpacity
//           onPress={() => {
//             if (isEditingTitle) {
//               handleEditTitle();
//             } else {
//               setIsEditingTitle(true);
//               setEditedTitle(currentTitle);
//             }
//           }}
//           style={styles.editIconButton}
//         >
//           <Icon
//             name={isEditingTitle ? 'checkmark' : 'pencil'}
//             size={24}
//             color={theme.primary}
//           />
//         </TouchableOpacity>
//       </View>

//       {/* Category Badge */}
//       <View style={[styles.badge, { backgroundColor: note.color + '20' }]}>
//         <Text style={[styles.badgeText, { color: note.color }]}>
//           {note.category}
//         </Text>
//       </View>

//       {/* Title */}
//       <Text style={[styles.title, { color: theme.text }]}>{note.title}</Text>

//       {/* Date */}
//       <Text style={[styles.date, { color: theme.textSecondary }]}>
//         {new Date(note.createdAt).toLocaleDateString('en-US', {
//           weekday: 'long',
//           year: 'numeric',
//           month: 'long',
//           day: 'numeric',
//         })}
//       </Text>

//       {/* Action Buttons */}
//       <View style={styles.actions}>
//         <TouchableOpacity
//           style={[styles.actionButton, { backgroundColor: theme.primary }]}
//           onPress={handleAISummary}
//           disabled={!!note.aiSummary} // Disable if dummy summary exists
//         >
//           <Icon name="sparkles" size={18} color="#FFF" />
//           <Text style={styles.actionText}>AI Summary</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.actionButton, { backgroundColor: theme.accent }]}
//           onPress={handleShare}
//         >
//           <Icon name="share-outline" size={18} color="#FFF" />
//           <Text style={styles.actionText}>Share</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.actionButton, { backgroundColor: theme.danger }]}
//           onPress={handleDelete}
//         >
//           <Icon name="trash-outline" size={18} color="#FFF" />
//           <Text style={styles.actionText}>Delete</Text>
//         </TouchableOpacity>
//       </View>

//       {/* AI Summary (dummy or real-time, only one shown) */}
//       {loadingSummary ? (
//         <View style={[styles.summaryBox, { backgroundColor: theme.card }]}>
//           <ActivityIndicator color={theme.primary} />
//           <Text style={[styles.summaryLoading, { color: theme.textSecondary }]}>
//             AI is thinking... 🤖
//           </Text>
//         </View>
//       ) : (
//         Array.isArray(summary) &&
//         summary.length > 0 && (
//           <View style={[styles.summaryBox, { backgroundColor: theme.card }]}>
//             <View style={styles.summaryHeader}>
//               <Icon name="sparkles" size={18} color={theme.primary} />
//               <Text style={[styles.summaryTitle, { color: theme.primary }]}>
//                 AI Summary
//               </Text>
//             </View>
//             {summary.map((point, idx) => (
//               <Text
//                 key={idx}
//                 style={[styles.summaryText, { color: theme.text }]}
//               >
//                 • {point}
//               </Text>
//             ))}
//           </View>
//         )
//       )}

//       {/* Note Content */}
//       <Text style={[styles.content, { color: theme.text }]}>
//         {note.content}
//       </Text>

//       {/* Attached Documents List - Impressive UI/UX */}
//       {Array.isArray(note.documents) && note.documents.length > 0 && (
//         <View style={styles.documentListContainer}>
//           <View style={styles.documentListHeader}>
//             <Text style={[styles.documentListTitle, { color: theme.primary }]}>
//               📎 Attached files
//             </Text>
//             <TouchableOpacity
//               style={styles.addDocButton}
//               onPress={handleAddDocuments}
//               activeOpacity={0.8}
//             >
//               <Icon name="add" size={20} color={theme.primary} />
//               <Text style={styles.addDocButtonText}>Add More</Text>
//             </TouchableOpacity>
//           </View>
//           <View style={styles.documentListGrid}>
//             {note.documents.map((doc, idx) => (
//               <View key={doc.uri} style={styles.documentCard}>
//                 <TouchableOpacity
//                   style={styles.documentIconWrap}
//                   onPress={() => handleViewDocument(doc)}
//                   activeOpacity={0.85}
//                 >
//                   <Icon
//                     name="document-text-outline"
//                     size={32}
//                     color={theme.primary}
//                   />
//                 </TouchableOpacity>
//                 <Text style={styles.documentName} numberOfLines={2}>
//                   {doc.name || doc.uri.split('/').pop()}
//                 </Text>
//                 <View style={styles.documentActions}>
//                   <TouchableOpacity
//                     onPress={() => handleViewDocument(doc)}
//                     activeOpacity={0.7}
//                   >
//                     <Icon
//                       name="eye"
//                       size={18}
//                       color={theme.accent}
//                       style={{ marginRight: 6 }}
//                     />
//                   </TouchableOpacity>
//                   <Text style={styles.documentType}>
//                     {doc.type
//                       ? doc.type.split('/').pop().toUpperCase()
//                       : 'FILE'}
//                   </Text>
//                   <TouchableOpacity
//                     onPress={() => handleDeleteDocument(doc.id)}
//                     activeOpacity={0.7}
//                     style={styles.deleteDocButton}
//                   >
//                     <Icon name="trash" size={18} color={theme.danger} />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             ))}
//           </View>
//         </View>
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   documentListContainer: {
//     marginBottom: 24,
//     backgroundColor: '#F5F6FA',
//     borderRadius: 14,
//     padding: 14,
//     shadowColor: '#6C5CE7',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },

//   documentListHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   addDocButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     backgroundColor: '#FFF',
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderWidth: 1.2,
//     borderColor: '#E0E0E0',
//     shadowColor: '#6C5CE7',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   addDocButtonText: {
//     color: '#6C5CE7',
//     fontWeight: '700',
//     fontSize: 13,
//     marginLeft: 4,
//   },
//   documentListTitle: {
//     fontSize: 17,
//     fontWeight: '700',
//     marginBottom: 10,
//     letterSpacing: 0.2,
//   },
//   documentListGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 14,
//     justifyContent: 'flex-start',
//   },
//   documentCard: {
//     width: 120,
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 8,
//     alignItems: 'center',
//     shadowColor: '#6C5CE7',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     elevation: 2,
//     borderWidth: 1.2,
//     borderColor: '#E0E0E0',
//   },
//   documentIconWrap: {
//     backgroundColor: '#F5F6FA',
//     borderRadius: 8,
//     padding: 8,
//     marginBottom: 8,
//   },
//   documentName: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 6,
//     minHeight: 32,
//   },
//   documentActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 2,
//   },
//   documentType: {
//     fontSize: 11,
//     color: '#6C5CE7',
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },
//   badge: {
//     alignSelf: 'flex-start',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   badgeText: {
//     fontSize: 12,
//     fontWeight: '700',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '800',
//     marginBottom: 8,
//   },
//   date: {
//     fontSize: 14,
//     marginBottom: 20,
//   },
//   actions: {
//     flexDirection: 'row',
//     gap: 8,
//     marginBottom: 20,
//   },
//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 10,
//     gap: 6,
//   },
//   actionText: {
//     color: '#FFF',
//     fontWeight: '600',
//     fontSize: 13,
//   },
//   summaryBox: {
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 20,
//   },
//   summaryHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginBottom: 8,
//   },
//   summaryTitle: {
//     fontWeight: '700',
//     fontSize: 14,
//   },
//   summaryLoading: {
//     textAlign: 'center',
//     marginTop: 8,
//   },
//   summaryText: {
//     fontSize: 14,
//     lineHeight: 22,
//   },
//   content: {
//     fontSize: 16,
//     lineHeight: 26,
//     marginBottom: 40,
//   },
// });

// export default NoteDetailScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';
import { viewDocument } from '@react-native-documents/viewer';
import { pick, isCancel } from '@react-native-documents/picker';
import useNoteStore from '../store/useNoteStore';
import { getAISummary } from '../services/aiService';
import RNFS from 'react-native-fs';

const NoteDetailScreen = ({ route, navigation }) => {
  const { note } = route.params;
  const { theme } = useTheme();

  const deleteNote = useNoteStore(state => state.deleteNote);
  const removeDocument = useNoteStore(state => state.removeDocument);
  const updateNote = useNoteStore(state => state.updateNote);
  const addDocument = useNoteStore(state => state.addDocument);

  /* ---------------- EDIT STATES ---------------- */
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);

  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content);

  /* ---------------- AI SUMMARY ---------------- */
  const [summary, setSummary] = useState(note.aiSummary || []);
  const [loadingSummary, setLoadingSummary] = useState(false);

  /* ---------------- TITLE EDIT ---------------- */
  const handleEditTitle = async () => {
    if (!editedTitle.trim()) {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }

    await updateNote(note.id, { title: editedTitle });
    setIsEditingTitle(false);

    navigation.setParams({
      note: { ...note, title: editedTitle },
    });
  };

  /* ---------------- CONTENT EDIT ---------------- */
  const handleEditContent = async () => {
    if (!editedContent.trim()) {
      Alert.alert('Error', 'Content cannot be empty');
      return;
    }

    await updateNote(note.id, { content: editedContent });
    setIsEditingContent(false);

    navigation.setParams({
      note: { ...note, content: editedContent },
    });
  };

  /* ---------------- AI SUMMARY ---------------- */
  const handleAISummary = async () => {
    if (!note.aiSummary) {
      setLoadingSummary(true);

      const result = await getAISummary(note.content);

      const points = result
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^[-•\d. ]+/, ''));

      setSummary(points);
      setLoadingSummary(false);
    }
  };

  /* ---------------- SHARE ---------------- */
  const handleShare = async () => {
    try {
      await Share.share({
        title: note.title,
        message: `${note.title}\n\n${note.content}`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  /* ---------------- DELETE NOTE ---------------- */
  const handleDelete = () => {
    Alert.alert('Delete Note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(note.id);
          navigation.goBack();
        },
      },
    ]);
  };

  /* ---------------- VIEW DOCUMENT ---------------- */
  const handleViewDocument = async doc => {
    try {
      const uri = doc.uri.startsWith('file://') ? doc.uri : `file://${doc.uri}`;

      await viewDocument({
        uri,
        name: doc.name,
        type: doc.type,
      });
    } catch (err) {
      Alert.alert('Error', 'Cannot open document');
    }
  };

  /* ---------------- ADD DOCUMENT ---------------- */
  const handleAddDocuments = async () => {
    try {
      const res = await pick({ allowMultiSelection: true });

      const existingUris = note.documents?.map(d => d.uri) || [];
      const filtered = res.filter(doc => !existingUris.includes(doc.uri));

      const newDocs = [];

      for (const doc of filtered) {
        const destPath = `${RNFS.DocumentDirectoryPath}/${Date.now()}_${
          doc.name
        }`;
        await RNFS.copyFile(doc.uri, destPath);

        const newDoc = {
          id: Date.now().toString() + Math.random(),
          name: doc.name,
          type: doc.type,
          uri: destPath,
        };

        await addDocument(note.id, newDoc);
        newDocs.push(newDoc);
      }

      navigation.setParams({
        note: {
          ...note,
          documents: [...(note.documents || []), ...newDocs],
        },
      });
    } catch (err) {
      if (isCancel && isCancel(err)) return;
      Alert.alert('Error', 'Failed to add documents');
    }
  };

  /* ---------------- DELETE DOCUMENT ---------------- */
  const handleDeleteDocument = async docId => {
    await removeDocument(note.id, docId);

    const filtered = (note.documents || []).filter(d => d.id !== docId);

    navigation.setParams({
      note: { ...note, documents: filtered },
    });
  };

  const currentTitle = route.params?.note?.title || note.title;
  const currentContent = route.params?.note?.content || note.content;

  /* ====================================================== */

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* TITLE */}
      <View style={styles.titleContainer}>
        {isEditingTitle ? (
          <TextInput
            value={editedTitle}
            onChangeText={setEditedTitle}
            autoFocus
            style={[
              styles.titleInput,
              {
                color: theme.text,
                borderColor: theme.primary,
                backgroundColor: theme.card,
              },
            ]}
          />
        ) : (
          <Text style={[styles.title, { color: theme.text }]}>
            {currentTitle}
          </Text>
        )}

        <TouchableOpacity
          onPress={() =>
            isEditingTitle ? handleEditTitle() : setIsEditingTitle(true)
          }
        >
          <Icon
            name={isEditingTitle ? 'checkmark' : 'pencil'}
            size={22}
            color={theme.primary}
          />
        </TouchableOpacity>
      </View>

      {/* CATEGORY */}
      <View style={[styles.badge, { backgroundColor: note.color + '20' }]}>
        <Text style={[styles.badgeText, { color: note.color }]}>
          {note.category}
        </Text>
      </View>

      {/* DATE */}
      <Text style={[styles.date, { color: theme.textSecondary }]}>
        {new Date(note.createdAt).toLocaleDateString()}
      </Text>

      {/* ACTIONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={handleAISummary}
        >
          <Icon name="sparkles" size={18} color="#FFF" />
          <Text style={styles.actionText}>AI Summary</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.accent }]}
          onPress={handleShare}
        >
          <Icon name="share-outline" size={18} color="#FFF" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.danger }]}
          onPress={handleDelete}
        >
          <Icon name="trash-outline" size={18} color="#FFF" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* AI SUMMARY */}
      {loadingSummary ? (
        <View style={[styles.summaryBox, { backgroundColor: theme.card }]}>
          <ActivityIndicator color={theme.primary} />
          <Text style={[styles.summaryLoading, { color: theme.textSecondary }]}>
            AI is thinking... 🤖
          </Text>
        </View>
      ) : (
        Array.isArray(summary) &&
        summary.length > 0 && (
          <View style={[styles.summaryBox, { backgroundColor: theme.card }]}>
            <View style={styles.summaryHeader}>
              <Icon name="sparkles" size={18} color={theme.primary} />
              <Text style={[styles.summaryTitle, { color: theme.primary }]}>
                AI Summary
              </Text>
            </View>

            {summary.map((point, idx) => (
              <Text
                key={idx}
                style={[styles.summaryText, { color: theme.text }]}
              >
                • {point}
              </Text>
            ))}
          </View>
        )
      )}

      {/* CONTENT */}
      <View style={styles.contentContainer}>
        {isEditingContent ? (
          <TextInput
            multiline
            value={editedContent}
            onChangeText={setEditedContent}
            style={[
              styles.contentInput,
              {
                color: theme.text,
                borderColor: theme.primary,
                backgroundColor: theme.card,
              },
            ]}
          />
        ) : (
          <Text style={[styles.content, { color: theme.text }]}>
            {currentContent}
          </Text>
        )}

        <TouchableOpacity
          onPress={() =>
            isEditingContent ? handleEditContent() : setIsEditingContent(true)
          }
        >
          <Icon
            name={isEditingContent ? 'checkmark' : 'pencil'}
            size={20}
            color={theme.primary}
          />
        </TouchableOpacity>
      </View>

      {/* DOCUMENTS */}
      {note.documents?.length > 0 && (
        <View
          style={[
            styles.documentListContainer,
            { backgroundColor: theme.card },
          ]}
        >
          <View style={styles.documentListHeader}>
            <Text style={[styles.documentListTitle, { color: theme.primary }]}>
              📎 Attached files
            </Text>

            <TouchableOpacity
              style={[
                styles.addDocButton,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
              onPress={handleAddDocuments}
            >
              <Icon name="add" size={18} color={theme.primary} />
              <Text style={[styles.addDocButtonText, { color: theme.primary }]}>
                Add More
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.documentListGrid}>
            {note.documents.map(doc => (
              <View
                key={doc.id}
                style={[
                  styles.documentCard,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleViewDocument(doc)}
                  style={styles.documentIconWrap}
                >
                  <Icon
                    name="document-text-outline"
                    size={32}
                    color={theme.primary}
                  />
                </TouchableOpacity>

                <Text
                  numberOfLines={2}
                  style={[styles.documentName, { color: theme.text }]}
                >
                  {doc.name}
                </Text>

                <View style={styles.documentActions}>
                  <TouchableOpacity onPress={() => handleViewDocument(doc)}>
                    <Icon name="eye" size={18} color={theme.accent} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeleteDocument(doc.id)}
                    style={{ marginLeft: 10 }}
                  >
                    <Icon name="trash" size={18} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: { fontSize: 26, fontWeight: '800', flex: 1 },

  titleInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },

  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginVertical: 10,
  },

  badgeText: { fontSize: 12, fontWeight: '700' },

  date: { fontSize: 13, marginBottom: 20 },

  actions: { flexDirection: 'row', gap: 8, marginBottom: 20 },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },

  actionText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

  summaryBox: { padding: 16, borderRadius: 12, marginBottom: 20 },

  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  summaryTitle: { fontWeight: '700', fontSize: 14 },

  summaryText: { fontSize: 14, marginTop: 4 },

  summaryLoading: { textAlign: 'center', marginTop: 8 },

  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
  },

  content: { fontSize: 16, lineHeight: 24, flex: 1 },

  contentInput: {
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 120,
  },

  documentListContainer: {
    borderRadius: 14,
    padding: 14,
  },

  documentListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  documentListTitle: { fontSize: 16, fontWeight: '700' },

  addDocButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  addDocButtonText: { marginLeft: 4, fontWeight: '600', fontSize: 12 },

  documentListGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  documentCard: {
    width: 110,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    alignItems: 'center',
  },

  documentIconWrap: {
    borderRadius: 6,
    padding: 6,
    marginBottom: 6,
  },

  documentName: { fontSize: 12, textAlign: 'center', marginBottom: 6 },

  documentActions: { flexDirection: 'row', alignItems: 'center' },
});
export default NoteDetailScreen;
