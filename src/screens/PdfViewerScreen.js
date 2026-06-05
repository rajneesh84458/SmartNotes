// import React from 'react';
// import { View, StyleSheet, ActivityIndicator } from 'react-native';
// import Pdf from 'react-native-pdf';
// import AnimatedHeader from '../components/AnimatedHeader';

// const PdfViewerScreen = ({ route }) => {
//   const { uri } = route.params;

//   return (
//     <View style={styles.container}>
//       <AnimatedHeader title="View File" showBackIcon={true} />
//       <Pdf
//         source={{ uri }}
//         style={styles.pdf}
//         trustAllCerts={false}
//         renderActivityIndicator={() => <ActivityIndicator />}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   pdf: { flex: 1 },
// });

// export default PdfViewerScreen;
import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Text,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Pdf from 'react-native-pdf';
import { useTheme } from '../theme/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const PdfViewerScreen = () => {
  const route = useRoute();
  const { theme } = useTheme();
  const { uri } = route.params;

  // Determine file type
  const fileExtension = uri?.split('.')?.pop()?.toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
  const isPdf = fileExtension === 'pdf';

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {isImage && (
        <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      )}

      {/* PDF Viewer */}
      {isPdf && (
        <Pdf
          source={{ uri }}
          style={styles.pdf}
          onError={error =>
            Alert.alert('Error', `Failed to load PDF: ${error}`)
          }
          onLoadComplete={numPages => console.log(`PDF has ${numPages} pages`)}
        />
      )}

      {/* Unsupported File */}
      {!isImage && !isPdf && (
        <View style={styles.unsupported}>
          <Icon name="document" size={48} color={theme.textSecondary} />
          <Text
            style={[styles.unsupportedText, { color: theme.textSecondary }]}
          >
            File type not supported
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  image: {
    flex: 1,
    width: '100%',
  },
  pdf: {
    flex: 1,
  },
  unsupported: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unsupportedText: {
    marginTop: 12,
    fontSize: 16,
  },
});

export default PdfViewerScreen;
