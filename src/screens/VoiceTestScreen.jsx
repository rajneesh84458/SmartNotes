import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import useVoiceToText from '../hooks/useVoiceToText';

const VoiceTestScreen = ({ navigation }) => {
  const {
    isListening,
    spokenText,
    partialText,
    error,
    isAvailable,
    permissionGranted,
    requestPermissions,
    toggleListening,
    resetText,
  } = useVoiceToText();

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation?.goBack()}>
        <Icon name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Text style={styles.title}>🎙️ Voice Test</Text>
        <Text style={styles.subtitle}>
          Test speech recognition
        </Text>

        {/* Permission Warning */}
        {!permissionGranted && (
          <View style={styles.permissionCard}>
            <Icon name="mic-off-outline" size={24} color="#FDCB6E" />
            <View style={styles.permissionContent}>
              <Text style={styles.permissionTitle}>
                Microphone Permission Needed
              </Text>
              <Text style={styles.permissionSubtitle}>
                Tap below to grant access
              </Text>
            </View>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermissions}>
              <Text style={styles.permissionButtonText}>Allow</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Status Cards */}
        <View style={styles.statusRow}>
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Permission</Text>
            <Text
              style={[
                styles.statusValue,
                { color: permissionGranted ? '#00B894' : '#FF6B6B' },
              ]}>
              {permissionGranted ? '✅ Granted' : '❌ Denied'}
            </Text>
          </View>
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text
              style={[
                styles.statusValue,
                { color: isListening ? '#FF6B6B' : '#888' },
              ]}>
              {isListening ? '🔴 Listening' : '⚪ Idle'}
            </Text>
          </View>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorCard}>
            <Icon name="warning" size={20} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Listening Animation */}
        {isListening && (
          <View style={styles.listeningIndicator}>
            <ActivityIndicator size="large" color="#6C5CE7" />
            <Text style={styles.listeningText}>Listening...</Text>
          </View>
        )}

        {/* Partial Text (Real-time) */}
        <View style={styles.textCard}>
          <Text style={styles.textLabel}>🔄 Status:</Text>
          <Text style={styles.partialText}>
            {partialText || 'Tap mic to start...'}
          </Text>
        </View>

        {/* Final Text */}
        <View style={styles.textCard}>
          <Text style={styles.textLabel}>✅ Result:</Text>
          <Text style={styles.finalText}>
            {spokenText || 'No result yet'}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          {/* Mic Toggle Button */}
          <TouchableOpacity
            onPress={toggleListening}
            style={[
              styles.micButton,
              {
                backgroundColor: isListening
                  ? '#FF6B6B'
                  : '#6C5CE7',
                opacity: isListening ? 0.8 : 1,
              },
            ]}
            activeOpacity={0.7}>
            <Icon
              name={isListening ? 'stop' : 'mic'}
              size={36}
              color="#FFF"
            />
          </TouchableOpacity>

          {/* Reset Button */}
          <TouchableOpacity
            onPress={resetText}
            style={styles.resetButton}
            activeOpacity={0.7}>
            <Icon name="refresh" size={22} color="#FFF" />
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📋 How it works:</Text>
          <Text style={styles.infoItem}>
            1. Tap the 🎙️ mic button to start listening
          </Text>
          <Text style={styles.infoItem}>
            2. Speak clearly — it listens continuously
          </Text>
          <Text style={styles.infoItem}>
            3. Partial words appear in real-time
          </Text>
          <Text style={styles.infoItem}>
            4. Tap the ⏹ stop button when you're done
          </Text>
          <Text style={styles.infoItem}>
            5. Full text appears in the Result box
          </Text>
          <Text style={styles.infoItem}>
            6. Tap Reset to clear and try again
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  // ────────── Permission Card ──────────
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDCB6E15',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FDCB6E',
  },
  permissionSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  permissionButton: {
    backgroundColor: '#FDCB6E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  permissionButtonText: {
    color: '#0F0F1A',
    fontSize: 13,
    fontWeight: '700',
  },
  // ────────── Status ──────────
  statusRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13,
    color: '#777',
    fontWeight: '600',
    marginBottom: 6,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  // ────────── Error ──────────
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B15',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 10,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    flex: 1,
  },
  // ────────── Listening Indicator ──────────
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    paddingVertical: 10,
  },
  listeningText: {
    fontSize: 16,
    color: '#6C5CE7',
    fontWeight: '600',
  },
  // ────────── Text Cards ──────────
  textCard: {
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  textLabel: {
    fontSize: 13,
    color: '#777',
    fontWeight: '600',
    marginBottom: 8,
  },
  partialText: {
    fontSize: 16,
    color: '#FDCB6E',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  finalText: {
    fontSize: 18,
    color: '#00B894',
    fontWeight: '600',
    lineHeight: 26,
  },
  // ────────── Buttons ──────────
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
  },
  micButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // ────────── Info Card ──────────
  infoCard: {
    backgroundColor: '#1A1A2E',
    padding: 20,
    borderRadius: 16,
    marginTop: 28,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 6,
    lineHeight: 22,
  },
});

export default VoiceTestScreen;