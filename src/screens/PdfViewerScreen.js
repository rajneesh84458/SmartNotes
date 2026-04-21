import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Pdf from 'react-native-pdf';

const PdfViewerScreen = ({ route }) => {
  const { uri } = route.params;

  return (
    <View style={styles.container}>
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
