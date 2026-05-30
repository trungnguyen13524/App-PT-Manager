import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { X, Zap, ZapOff, Image as ImageIcon } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY } from '../../../theme';

const { width } = Dimensions.get('window');

const FoodScanScreen = () => {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.permissionText}>Ứng dụng cần quyền truy cập Camera để quét món ăn</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Cho phép truy cập</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleCapture = async () => {
    if (isScanning || !cameraRef.current) return;

    try {
      setIsScanning(true);

      // Chụp ảnh thật
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
      });

      // GIẢ LẬP: Đợi 1.5 giây giống như đang gọi AI thật
      setTimeout(() => {
        setIsScanning(false);
        navigation.navigate('ScanResult', {
          scannedData: {
            name: "Món ăn đang quét...", // Placeholder vì chưa có AI
            calories: 350,
            protein: 20,
            carbs: 40,
            fat: 10,
            confidence: 99,
            image: photo.uri
          }
        });
      }, 1500);

    } catch (error) {
      console.error(error);
      setIsScanning(false);
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại!");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flash ? 'on' : 'off'}
        ref={cameraRef}
      />

      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <X color="#fff" size={28} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFlash(!flash)} style={styles.iconBtn}>
            {flash ? <Zap color="#FFD600" size={24} fill="#FFD600" /> : <ZapOff color="#fff" size={24} />}
          </TouchableOpacity>
        </View>

        <View style={styles.scanTargetWrapper}>
          <View style={styles.scanFrame}>
            {isScanning && <View style={styles.scanLine} />}
          </View>
          <Text style={styles.scanHint}>
            {isScanning ? 'Đang phân tích món ăn...' : 'Đưa món ăn vào khung hình'}
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.sideBtn}>
            <ImageIcon color="#fff" size={28} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureBtn, isScanning && styles.captureBtnDisabled]}
            onPress={handleCapture}
            disabled={isScanning}
          >
            {isScanning ? (
              <ActivityIndicator color={COLORS.primary} size="large" />
            ) : (
              <View style={styles.captureInner} />
            )}
          </TouchableOpacity>

          <View style={styles.sideBtn} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  permissionText: {
    ...TYPOGRAPHY.body1,
    textAlign: 'center',
    marginBottom: 20,
    color: COLORS.textSecondary,
  },
  permissionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionBtnText: { color: '#fff', fontWeight: '700' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTargetWrapper: { alignItems: 'center' },
  scanFrame: {
    width: width * 0.75,
    height: width * 0.75,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 30,
    overflow: 'hidden',
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: 0,
  },
  scanHint: {
    color: '#fff',
    marginTop: 24,
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#fff',
  },
  captureBtnDisabled: { opacity: 0.5 },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  sideBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default FoodScanScreen;
