import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle as SvgCircle } from 'react-native-svg';
import { COLORS } from '../../theme';

export const AbstractBackground = memo(() => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <Svg width="100%" height="100%">
      <Defs>
        <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={COLORS.background} />
          <Stop offset="100%" stopColor={COLORS.surface} />
        </LinearGradient>
        <LinearGradient id="circleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.1" />
          <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0.03" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#bgGrad)" />
      <SvgCircle cx="15%" cy="10%" r="140" fill="url(#circleGrad1)" />
      <SvgCircle cx="90%" cy="40%" r="180" fill="url(#circleGrad1)" />
    </Svg>
  </View>
));
