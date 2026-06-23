import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Zap } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

const ProUpgradeBanner = ({ tier }) => {
  const navigation = useNavigation();

  if (tier === 'PRO') {
    return null;
  }

  return (
    <TouchableOpacity 
      style={styles.proBannerWrapper} 
      onPress={() => navigation.navigate('Pricing')}
      activeOpacity={0.9}
    >
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="proGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF8A00" stopOpacity="1" />
            <Stop offset="100%" stopColor="#E52E71" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#proGrad)" />
      </Svg>
      <View style={styles.proBannerContent}>
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text style={styles.proTitle}>👑 VIP UNLOCK</Text>
          <Text style={styles.proDesc}>Mở khóa AI Quét thực phẩm & thực đơn riêng</Text>
        </View>
        <Zap size={28} color="#FFF" fill="#FFF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  proBannerWrapper: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF8A00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  proBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  proTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  proDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 20,
  },
});

export default ProUpgradeBanner;
