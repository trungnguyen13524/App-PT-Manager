import React, { memo } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../theme';

const WaveBackground = memo(() => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: COLORS.background }]} />
    <Image 
      source={{ uri: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop' }}
      style={[StyleSheet.absoluteFillObject, { opacity: 0.15 }]}
      blurRadius={10}
    />
    <Svg width="100%" height="400" viewBox="0 0 1440 320" style={{ position: 'absolute', top: 0 }}>
      <Path fill={COLORS.primaryLight} d="M0,160L48,149.3C96,139,192,117,288,133.3C384,149,480,203,576,218.7C672,235,768,213,864,181.3C960,149,1056,107,1152,112C1248,117,1344,171,1392,197.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
      <Path fill={COLORS.primary} fillOpacity={0.6} d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
      <Path fill={COLORS.primaryDark} fillOpacity={0.8} d="M0,64L60,74.7C120,85,240,107,360,112C480,117,600,107,720,85.3C840,64,960,32,1080,37.3C1200,43,1320,85,1380,106.7L1440,128L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
    </Svg>
  </View>
));

export default WaveBackground;
