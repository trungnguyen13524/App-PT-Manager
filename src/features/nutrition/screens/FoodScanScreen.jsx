import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { X, Zap, ZapOff, Image as ImageIcon } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY } from '../../../theme';
import { useDialogStore } from '../../../store/dialogStore';
import scanService from '../../../api/services/scan.service';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.75;
const OVERLAY_COLOR = 'rgba(0, 0, 0, 0.55)'; // Elegant dark overlay

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
        <ActivityIndicator size="large" color="#FFFFFF" />
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

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
      });

      const formData = new FormData();
      formData.append('image', {
        uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });

      try {
        const response = await scanService.scanImage(formData);
        const aiData = response?.data || response || {};
        
        setIsScanning(false);
        navigation.navigate('ScanResult', {
          scannedData: {
            scanId: aiData.id || aiData.scanId || null,
            name: aiData.name || aiData.foodName || "Món ăn (AI nhận diện)",
            calories: aiData.calories || 0,
            protein: aiData.macros?.proteinG || aiData.protein || 0,
            carbs: aiData.macros?.carbsG || aiData.carbs || 0,
            fat: aiData.macros?.fatG || aiData.fat || 0,
            confidence: aiData.confidence || 90,
            image: photo.uri
          }
        });
      } catch (apiError) {
        console.warn('Scan API error, using fallback:', apiError);
        setIsScanning(false);
        navigation.navigate('ScanResult', {
          scannedData: {
            name: "Món ăn (Demo API Failed)",
            calories: 350,
            protein: 20,
            carbs: 40,
            fat: 10,
            confidence: 99,
            image: photo.uri
          }
        });
      }

    } catch (error) {
      console.error(error);
      setIsScanning(false);
      useDialogStore.getState().showDialog({
        title: "Lỗi",
        message: "Không thể chụp ảnh. Vui lòng thử lại!",
        type: 'error'
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flash ? 'on' : 'off'}
        ref={cameraRef}
      />

      <View style={StyleSheet.absoluteFill}>
        <View style={styles.maskTop} />
        <View style={styles.maskCenterRow}>
          <View style={styles.maskSide} />
          
          <View style={styles.transparentCenter}>
            <View style={styles.scannerFrame} />
          </View>

          <View style={styles.maskSide} />
        </View>
        <View style={styles.maskBottom}>
           <View style={styles.hintContainer}>
            <View style={styles.hintPill}>
              {isScanning ? <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} /> : null}
              <Text style={styles.hintText}>
                {isScanning ? 'Đang phân tích...' : 'Đưa món ăn vào khung hình'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <SafeAreaView style={styles.uiOverlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.glassIconBtn}>
            <X color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFlash(!flash)} style={styles.glassIconBtn}>
            {flash ? <Zap color="#FFD600" size={24} fill="#FFD600" /> : <ZapOff color="#FFFFFF" size={24} />}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.glassIconBtn}>
            <ImageIcon color="#FFFFFF" size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureBtnOuter, isScanning && styles.captureBtnDisabled]}
            onPress={handleCapture}
            disabled={isScanning}
            activeOpacity={0.8}
          >
            <View style={styles.captureBtnInner} />
          </TouchableOpacity>

          <View style={{ width: 50, height: 50 }} />
        </View>
      </SafeAreaView>
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
    backgroundColor: '#0F172A',
  },
  permissionText: {
    ...TYPOGRAPHY.body1,
    textAlign: 'center',
    marginBottom: 20,
    color: '#94A3B8',
  },
  permissionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionBtnText: { color: '#000', fontWeight: '800' },
  
  // --- MASK OVERLAY ---
  maskTop: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
  },
  maskCenterRow: {
    flexDirection: 'row',
    height: SCANNER_SIZE,
  },
  maskSide: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
  },
  transparentCenter: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  maskBottom: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
    alignItems: 'center',
  },

  // --- ELEGANT SCANNER FRAME ---
  scannerFrame: {
    width: '100%',
    height: '100%',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  // --- UI ELEMENTS OVERLAY ---
  uiOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: 20,
    pointerEvents: 'box-none',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  glassIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  // --- CLEAN TEXT PILL ---
  hintContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  hintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // --- MINIMALIST CAPTURE BUTTON (iOS STYLE) ---
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureBtnOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  captureBtnDisabled: {
    opacity: 0.5,
  },
  captureBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  }
});

export default FoodScanScreen;
