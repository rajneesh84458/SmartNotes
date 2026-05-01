import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Share,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';
import ActionSheet from 'react-native-actions-sheet';
import { pick, isCancel } from '@react-native-documents/picker';
import useNoteStore from '../store/useNoteStore';
import { getAISummary } from '../services/aiService';
import RNFS from 'react-native-fs';
import AnimatedHeader from '../components/AnimatedHeader';

const NoteDetailScreen = ({ route, navigation }) => {
  const { theme } = useTheme();

  const removeDocument = useNoteStore(state => state.removeDocument);
  const addDocument = useNoteStore(state => state.addDocument);
  const updateNote = useNoteStore(state => state.updateNote);

  const actionSheetRef = useRef(null);

  const [noteState, setNoteState] = useState(route.params.note); //  LOCAL STATE FIX

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [summaryMap, setSummaryMap] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [currentSummary, setCurrentSummary] = useState('');

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(noteState.title);

  const [isEditingContent, setIsEditingContent] = useState(false);
  const [content, setContent] = useState(noteState.content);

  /* ---------------- OPEN SHEET ---------------- */
  const openSheet = doc => {
    setSelectedDoc(doc);
    actionSheetRef.current?.show();
  };

  /* ---------------- VIEW ---------------- */
  const handleView = () => {
    actionSheetRef.current?.hide();

    let uri = selectedDoc.uri;
    if (!uri.startsWith('file://')) {
      uri = `file://${uri}`;
    }

    navigation.navigate('PdfViewer', { uri });
  };

  /* ---------------- SHARE ---------------- */
  const handleShare = async () => {
    actionSheetRef.current?.hide();

    try {
      await Share.share({
        title: selectedDoc.name,
        message: selectedDoc.uri,
      });
    } catch (e) {}
  };

  /* ---------------- DELETE FIX ---------------- */
  const handleDelete = () => {
    actionSheetRef.current?.hide();

    Alert.alert('Delete', 'Remove this file?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeDocument(noteState.id, selectedDoc.id);

          // ✅ LOCAL UI UPDATE (IMPORTANT)
          const updatedDocs = noteState.documents.filter(
            d => d.id !== selectedDoc.id,
          );

          setNoteState(prev => ({
            ...prev,
            documents: updatedDocs,
          }));
        },
      },
    ]);
  };

  /* ---------------- ADD DOC + DUPLICATE FIX ---------------- */
  const handleAddDocuments = async () => {
    try {
      const res = await pick({ allowMultiSelection: true });

      const existingDocs = noteState.documents || [];
      const newDocs = [];

      for (const doc of res) {
        const isDuplicate = existingDocs.some(
          d => d.name === doc.name && d.size === doc.size,
        );

        if (isDuplicate) {
          Alert.alert('Duplicate', `${doc.name} already added`);
          continue;
        }

        const dest = `${RNFS.DocumentDirectoryPath}/${Date.now()}_${doc.name}`;
        await RNFS.copyFile(doc.uri, dest);

        const newDoc = {
          id: Date.now().toString() + Math.random(),
          name: doc.name,
          type: doc.type,
          size: doc.size,
          uri: dest,
        };

        await addDocument(noteState.id, newDoc);
        newDocs.push(newDoc);
      }

      if (newDocs.length > 0) {
        setNoteState(prev => ({
          ...prev,
          documents: [...(prev.documents || []), ...newDocs],
        }));
      }
    } catch (e) {
      if (isCancel(e)) return;
      Alert.alert('Error', 'Failed to add docs');
    }
  };

  /* ---------------- AI SUMMARY ---------------- */

  const handleSummary = async () => {
    actionSheetRef.current?.hide();
    setLoadingSummary(true);

    const result = await getAISummary(selectedDoc.uri);

    setCurrentSummary(result); //  store summary
    setSummaryModalVisible(true); //  open modal

    setLoadingSummary(false);
  };

  const handleSaveSummary = async () => {
    const updatedContent =
      noteState.content + '\n\n🤖 AI Summary:\n' + currentSummary;

    await updateNote(noteState.id, {
      content: updatedContent,
    });

    setContent(updatedContent); // UI sync
    setSummaryModalVisible(false);

    Alert.alert('Saved', 'Summary added to note');
  };
  /* ---------------- SAVE ---------------- */
  const saveTitle = async () => {
    await updateNote(noteState.id, { title });
    setIsEditingTitle(false);
  };

  const saveContent = async () => {
    await updateNote(noteState.id, { content });
    setIsEditingContent(false);
  };

  /* ====================================================== */

  return (
    <>
      <AnimatedHeader title="Note" showBackIcon={true} />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {/* TITLE */}
        <View style={styles.row}>
          {isEditingTitle ? (
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={[styles.title, { color: theme.text }]}
            />
          ) : (
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          )}

          <TouchableOpacity
            onPress={() =>
              isEditingTitle ? saveTitle() : setIsEditingTitle(true)
            }
          >
            <Icon
              name={isEditingTitle ? 'checkmark' : 'pencil'}
              size={20}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>

        {/* CONTENT */}
        <View style={styles.row}>
          {isEditingContent ? (
            <TextInput
              multiline
              value={content}
              onChangeText={setContent}
              style={[styles.content, { color: theme.text }]}
            />
          ) : (
            <Text style={[styles.content, { color: theme.text }]}>
              {content}
            </Text>
          )}

          <TouchableOpacity
            onPress={() =>
              isEditingContent ? saveContent() : setIsEditingContent(true)
            }
          >
            <Icon
              name={isEditingContent ? 'checkmark' : 'pencil'}
              size={18}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>

        {/* ADD BUTTON */}
        <TouchableOpacity style={styles.addBtn} onPress={handleAddDocuments}>
          <Icon name="attach" size={20} color="#FFF" />
          <Text style={styles.addText}>Add Documents</Text>
        </TouchableOpacity>

        {/* GRID */}
        <View style={styles.grid}>
          {noteState.documents?.map(doc => (
            <View key={doc.id} style={styles.cardWrapper}>
              <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.card }]}
                onPress={() => openSheet(doc)}
              >
                <Icon name="document-text" size={28} color={theme.primary} />
                <Text
                  numberOfLines={2}
                  style={[styles.name, { color: theme.text }]}
                >
                  {doc.name}
                </Text>
              </TouchableOpacity>

              {summaryMap[doc.id] && (
                <View
                  style={[styles.summaryBox, { backgroundColor: theme.card }]}
                >
                  <Text style={{ color: theme.primary }}>🤖 Summary</Text>
                  <Text style={{ color: theme.text }}>
                    {summaryMap[doc.id]}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {loadingSummary && <ActivityIndicator style={{ marginTop: 20 }} />}
      </ScrollView>

      {/* ACTION SHEET */}
      <ActionSheet ref={actionSheetRef}>
        <View style={{ padding: 20 }}>
          <TouchableOpacity onPress={handleView} style={styles.sheetBtn}>
            <Icon name="eye-outline" size={20} />
            <Text style={styles.sheetText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSummary} style={styles.sheetBtn}>
            <Icon name="sparkles-outline" size={20} />
            <Text style={styles.sheetText}>AI Summary</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} style={styles.sheetBtn}>
            <Icon name="share-social-outline" size={20} />
            <Text style={styles.sheetText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDelete} style={styles.sheetBtn}>
            <Icon name="trash-outline" size={20} color="red" />
            <Text style={[styles.sheetText, { color: 'red' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>

      <Modal visible={summaryModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, { backgroundColor: theme.card }]}
          >
            {/* HEADER */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                🤖 AI Summary
              </Text>

              <TouchableOpacity onPress={() => setSummaryModalVisible(false)}>
                <Icon name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* CONTENT */}
            <ScrollView style={{ marginTop: 10 }}>
              <Text style={{ color: theme.text, lineHeight: 20 }}>
                {currentSummary}
              </Text>
            </ScrollView>

            {/* SAVE BUTTON */}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveSummary}
            >
              <Text style={styles.saveText}>Save Summary</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  title: { fontSize: 22, fontWeight: '800', flex: 1 },

  content: { marginVertical: 10, flex: 1 },

  addBtn: {
    backgroundColor: '#6C5CE7',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },

  addText: { color: '#FFF', fontWeight: '700' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  cardWrapper: {
    width: '48%',
    marginBottom: 12,
  },

  card: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
  },

  name: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },

  summaryBox: {
    padding: 10,
    borderRadius: 10,
    marginTop: 6,
  },

  sheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 10,
  },

  sheetText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  saveBtn: {
    backgroundColor: '#6C5CE7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },

  saveText: {
    color: '#FFF',
    fontWeight: '700',
  },
});

export default NoteDetailScreen;
