import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../theme';

const NutriCard = ({ children, style, onPress, elevated = true }) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container 
      style={[
        styles.card, 
        elevated && styles.elevated, 
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.borderRadius.xl,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
});

export default NutriCard;
