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
  Image as RNImage,
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
  const [scanStatusMsg, setScanStatusMsg] = useState('Đang phân tích...');
  const [capturedImageUri, setCapturedImageUri] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2D3748" />
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
      setCapturedImageUri(photo.uri);
      
      await processAndUploadImage(photo.uri);
    } catch (error) {
      console.error(error);
      setIsScanning(false);
      setCapturedImageUri(null);
      useDialogStore.getState().showDialog({
        title: "Lỗi",
        message: "Không thể chụp ảnh. Vui lòng thử lại!",
        type: 'error'
      });
    }
  };

  const processAndUploadImage = async (uri, attempt = 1) => {
    setIsScanning(true);
    if (attempt === 1) setScanStatusMsg('Đang phân tích...');
    
    try {
      const uriPath = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
      const fileExtension = uriPath.split('.').pop().toLowerCase();
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
      const fileName = `scan_${Date.now()}.${fileExtension}`;

      const formData = new FormData();
      formData.append('image', {
        uri: uriPath,
        name: fileName,
        type: mimeType,
      });

      const response = await scanService.scanImage(formData);
      const aiData = response?.data || response || {};
      
      setIsScanning(false);
      setScanStatusMsg('Đang phân tích...');
      navigation.navigate('ScanResult', {
        scannedData: {
          scanId: aiData.id || aiData.scanId || null,
          name: aiData.name || aiData.foodName || "Món ăn (AI nhận diện)",
          calories: aiData.calories || aiData.Calories || aiData.nutrition?.calories || aiData.nutritionalInfo?.calories || aiData.nutritional_info?.calories || 0,
          protein: aiData.macros?.proteinG || aiData.protein || aiData.Protein || aiData.macros?.protein || aiData.nutrition?.protein || aiData.nutrition?.proteinG || 0,
          carbs: aiData.macros?.carbsG || aiData.carbs || aiData.Carbs || aiData.macros?.carbs || aiData.nutrition?.carbs || aiData.nutrition?.carbsG || 0,
          fat: aiData.macros?.fatG || aiData.fat || aiData.Fat || aiData.macros?.fat || aiData.nutrition?.fat || aiData.nutrition?.fatG || 0,
          confidence: aiData.confidence || 90,
          ingredients: aiData.ingredients || [],
          portion: aiData.portion || "",
          image: uri
        }
      });
    } catch (apiError) {
      console.error(`Lỗi API nhận diện (Lần ${attempt}):`, apiError);
      let errorMsg = apiError?.message || "";
      
      // Nếu là lỗi 502/sập server và chưa quá 3 lần thử -> tự động đợi và thử lại
      if ((errorMsg.includes('502') || errorMsg.includes('<!DOCTYPE') || apiError?.code === 'AI_SERVICE_UNAVAILABLE' || apiError?.code === 'HTTP_502') && attempt < 3) {
        setScanStatusMsg(`Server đang khởi động lại...\nSẽ thử lại sau 15s (Lần ${attempt}/3)`);
        
        // Đợi 15 giây rồi gọi lại chính hàm này (do Render Free tier khởi động mất khoảng 50s)
        setTimeout(() => {
          processAndUploadImage(uri, attempt + 1);
        }, 15000);
        return; // Kết thúc để hàm setTimout chạy
      }

      // Nếu đã thử quá 3 lần hoặc là lỗi khác thì hiện thông báo
      setIsScanning(false);
      setScanStatusMsg('Đang phân tích...');
      
      if (!errorMsg) errorMsg = "Không thể nhận diện món ăn. Vui lòng kiểm tra mạng hoặc thử lại sau.";
      if (errorMsg.includes('<!DOCTYPE html>') || errorMsg.includes('502') || apiError?.code === 'AI_SERVICE_UNAVAILABLE') {
        errorMsg = "Server vẫn chưa khởi động xong. Bạn có muốn tự nhập thông tin món ăn không?";
      } else if (errorMsg.length > 100) {
        errorMsg = "Đã xảy ra lỗi hệ thống (AI Server Error). Vui lòng thử lại sau.";
      }

      useDialogStore.getState().showDialog({
        title: "Lỗi nhận diện AI",
        message: errorMsg,
        type: 'warning',
        buttons: [
          { text: 'Đóng', style: 'cancel' },
          { 
            text: 'Nhập thủ công', 
            onPress: () => {
              navigation.navigate('ScanResult', {
                scannedData: {
                  scanId: null,
                  name: "",
                  calories: 0,
                  protein: 0,
                  carbs: 0,
                  fat: 0,
                  confidence: 0,
                  ingredients: [],
                  portion: "",
                  image: uri
                }
              });
            }
          }
        ]
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {capturedImageUri ? (
        <RNImage source={{ uri: capturedImageUri }} style={StyleSheet.absoluteFill} />
      ) : (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          flash={flash ? 'on' : 'off'}
          ref={cameraRef}
        />
      )}

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
              {isScanning ? <ActivityIndicator color="#2D3748" size="small" style={{ marginRight: 8 }} /> : null}
              <Text style={[styles.hintText, isScanning && { textAlign: 'center' }]}>
                {isScanning ? scanStatusMsg : 'Đưa món ăn vào khung hình'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <SafeAreaView style={styles.uiOverlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.glassIconBtn}>
            <X color="#2D3748" size={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFlash(!flash)} style={styles.glassIconBtn}>
            {flash ? <Zap color="#FFD600" size={24} fill="#FFD600" /> : <ZapOff color="#2D3748" size={24} />}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          {capturedImageUri ? (
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-evenly', paddingHorizontal: 20 }}>
              <TouchableOpacity 
                style={[styles.retakeBtn, isScanning && styles.captureBtnDisabled]}
                onPress={() => setCapturedImageUri(null)}
                disabled={isScanning}
              >
                <Text style={styles.retakeBtnText}>Chụp lại</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.retryBtn, isScanning && styles.captureBtnDisabled]}
                onPress={() => processAndUploadImage(capturedImageUri)}
                disabled={isScanning}
              >
                <Text style={styles.retryBtnText}>Thử lại ảnh này</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.glassIconBtn}>
                <ImageIcon color="#2D3748" size={24} />
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
            </>
          )}
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
    backgroundColor: '#2D3748',
  },
  permissionText: {
    ...TYPOGRAPHY.body1,
    textAlign: 'center',
    marginBottom: 20,
    color: '#4A5568',
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
    color: '#2D3748',
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
    borderColor: '#2D3748',
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
    backgroundColor: '#2D3748',
  },
  retakeBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  retakeBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  retryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
  },
  retryBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  }
});

export default FoodScanScreen;
