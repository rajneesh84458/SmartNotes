import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Pdf from 'react-native-pdf';
import AnimatedHeader from '../components/AnimatedHeader';

const PdfViewerScreen = ({ route }) => {
  const { uri } = route.params;

  return (
    <View style={styles.container}>
      <AnimatedHeader title="View File" showBackIcon={true} />
      <Pdf
        source={{ uri }}
        style={styles.pdf}
        trustAllCerts={false}
        renderActivityIndicator={() => <ActivityIndicator />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  pdf: { flex: 1 },
});

export default PdfViewerScreen;
