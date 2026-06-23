import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { X, ChevronLeft } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY } from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { url } = route.params || {};

  const handleNavigationStateChange = (navState) => {
    // Kiểm tra nếu URL chuyển hướng về trang thành công hoặc thất bại của NutriCoach
    if (navState.url.includes('nutricoach.vn/payment/success')) {
      navigation.navigate('MainTab', { screen: 'Trang chủ' });
      // Thêm thông báo hoặc cập nhật state ở đây nếu cần
    } else if (navState.url.includes('nutricoach.vn/payment/cancel')) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MainTab')} style={styles.backBtn}>
          <X color={COLORS.text} size={24} />
        </TouchableOpacity>
      </View>
      
      <WebView 
        source={{ uri: url }} 
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        style={styles.webview}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backBtn: { padding: 4 },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  webview: { flex: 1 }
});

export default CheckoutScreen;
