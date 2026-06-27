import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Animated } from 'react-native';
import { COLORS } from '../utils/constants';
import { FadeInDown, ZoomIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';

const ColorPicker = ({
  index = 0,
  color = '',
  selectedColor = '',
  handleColorSelect = () => {},
}) => {
  return (
    <Animated.View
      key={color}
      entering={ZoomIn.delay(400 + index * 80).springify()}
    >
      <TouchableOpacity
        onPress={handleColorSelect}
        style={[
          styles.colorCircle,
          { backgroundColor: selectedColor },
          selectedColor === color && styles.colorSelected,
        ]}
      >
        {selectedColor === color && (
          <Icon name="checkmark" size={16} color="#FFF" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ColorPicker;
const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelected: {
    borderWidth: 2,
    borderColor: '#FFF',
  },
});
