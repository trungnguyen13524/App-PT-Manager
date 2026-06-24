import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Edit3, DollarSign, Clock, Tag, AlignLeft, Lock, ImageIcon, UploadCloud, PlayCircle } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriButton from '../../../components/shared/NutriButton';
import { usePTStore } from '../../../store/ptStore';
import { useDialogStore } from '../../../store/dialogStore';
import ptService from '../../../api/services/pt.service';

const CourseMetaScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Nhan course tu params neu la mode Edit
  const editingCourse = route.params?.course;
  const isEditMode = !!editingCourse;
  
  const { createCourse, updateCourse, isLoading } = usePTStore();

  // Lấy youtube ID từ tags nếu có
  const existingYtTag = editingCourse?.tags?.find(t => t.startsWith('YT_'));
  let initialYtId = existingYtTag ? existingYtTag.replace('YT_', '') : (editingCourse?.youtubeVideoId || '');
  if (initialYtId) {
    const match = initialYtId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (match) initialYtId = match[1];
  }

  const [formData, setFormData] = useState({
    title: editingCourse?.title || '',
    description: editingCourse?.description || '',
    priceVnd: editingCourse?.priceVnd ? String(editingCourse.priceVnd) : '',
    durationDays: editingCourse?.durationDays ? String(editingCourse.durationDays) : '',
    tags: editingCourse?.tags ? editingCourse.tags.filter(t => !t.startsWith('YT_')).join(', ') : '',
    youtubeVideoId: initialYtId
  });
  
  const [thumbnailUri, setThumbnailUri] = useState(editingCourse?.thumbnailUrl || null);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  
  // Lock fields if course has enrollments
  const enrollmentCount = editingCourse?.enrollmentCount || editingCourse?.enrolled || 0;
  const isLocked = isEditMode && enrollmentCount > 0;
  const isArchived = editingCourse?.status === 'ARCHIVED';

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePickThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setThumbnailUri(result.assets[0].uri);
    }
  };

  const uploadThumbnailIfNeed = async (courseId) => {
    if (thumbnailUri && !thumbnailUri.startsWith('http')) {
      try {
        setIsUploadingThumb(true);
        const formData = new FormData();
        formData.append('thumbnail', {
          uri: thumbnailUri,
          name: `thumb_${courseId}.jpg`,
          type: 'image/jpeg'
        });
        await ptService.uploadCourseThumbnail(courseId, formData);
      } catch (error) {
        useDialogStore.getState().showDialog({
          title: 'Lỗi tải ảnh',
          message: 'Tạo khóa học thành công nhưng không thể tải ảnh bìa lên.',
          type: 'warning'
        });
      } finally {
        setIsUploadingThumb(false);
      }
    }
  };

  const handleRestore = async () => {
    try {
      setIsUploadingThumb(true);
      await ptService.restoreCourse(editingCourse.id);
      useDialogStore.getState().showDialog({
        title: 'Thành công',
        message: 'Khóa học đã được khôi phục về trạng thái Draft.',
        type: 'success',
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }]
      });
    } catch (err) {
      useDialogStore.getState().showDialog({
        title: 'Lỗi',
        message: 'Không thể khôi phục khóa học lúc này.',
        type: 'error'
      });
    } finally {
      setIsUploadingThumb(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.priceVnd || !formData.durationDays) {
      useDialogStore.getState().showDialog({
        title: 'Thiếu thông tin',
        message: 'Vui lòng điền đủ Tên khóa học, Giá tiền và Số ngày.',
        type: 'warning'
      });
      return;
    }

    if (!formData.description || formData.description.trim().length < 20) {
      useDialogStore.getState().showDialog({
        title: 'Mô tả quá ngắn',
        message: 'Mô tả chi tiết khóa học phải có ít nhất 20 ký tự để học viên hiểu rõ hơn.',
        type: 'warning'
      });
      return;
    }

    const price = parseInt(formData.priceVnd, 10);
    const duration = parseInt(formData.durationDays, 10);

    // Validation
    if (price < 50000 || price > 50000000 || price % 1000 !== 0) {
      useDialogStore.getState().showDialog({
        title: 'Lỗi Giá Tiền',
        message: 'Giá tiền phải từ 50.000đ đến 50.000.000đ và chẵn từng nghìn đồng.',
        type: 'warning'
      });
      return;
    }

    if (duration < 1 || duration > 365) {
      useDialogStore.getState().showDialog({
        title: 'Lỗi Thời Gian',
        message: 'Số ngày học viên được phép truy cập phải từ 1 đến 365 ngày.',
        type: 'warning'
      });
      return;
    }

    const parsedTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (parsedTags.length === 0) {
      useDialogStore.getState().showDialog({
        title: 'Thiếu Tags',
        message: 'Vui lòng nhập ít nhất 1 Tag (từ khóa) cho khóa học.',
        type: 'warning'
      });
      return;
    }

    let ytIdStr = '';
    if (formData.youtubeVideoId) {
      let ytId = formData.youtubeVideoId.trim();
      const match = ytId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
      if (match) ytId = match[1];
      ytIdStr = ytId;
      
      // Loại bỏ tag youtube cũ nếu có
      const filteredTags = parsedTags.filter(t => !t.startsWith('YT_'));
      filteredTags.push(`YT_${ytId}`);
      parsedTags.length = 0;
      parsedTags.push(...filteredTags);
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      thumbnailUrl: "",
      priceVnd: price,
      durationDays: duration,
      tags: parsedTags
    };

    if (isEditMode) {
      const result = await updateCourse(editingCourse.id, payload);
      if (result.success) {
        await uploadThumbnailIfNeed(editingCourse.id);
        
        useDialogStore.getState().showDialog({
          title: 'Cập nhật thành công',
          message: 'Khóa học đã được cập nhật.',
          type: 'success',
          buttons: [{ text: 'OK', onPress: () => navigation.goBack() }]
        });
      } else {
        if (result.locked) {
          useDialogStore.getState().showDialog({
            title: 'Bị khóa',
            message: 'Không thể sửa giá và thời gian vì khóa học đã có học viên đăng ký.',
            type: 'error'
          });
        } else {
          useDialogStore.getState().showDialog({
            title: 'Lỗi',
            message: typeof result.error === 'string' ? result.error : JSON.stringify(result.error),
            type: 'error'
          });
        }
      }
    } else {
      payload.modules = [
        {
          title: 'Chương 1',
          displayOrder: 0,
          lessons: [
            {
              title: 'Bài học 1',
              ...(ytIdStr ? { youtubeVideoId: ytIdStr } : {}),
              durationMin: 0,
              displayOrder: 0
            }
          ]
        }
      ];

      const result = await createCourse(payload);
      if (result.success) {
        await uploadThumbnailIfNeed(result.courseId);
        
        // Tự động chuyển hướng sang màn hình Soạn giáo trình luôn, mượt mà không cần popup
        navigation.replace('CurriculumBuilder', { courseId: result.courseId });
      } else {
        useDialogStore.getState().showDialog({
          title: 'Lỗi',
          message: typeof result.error === 'string' ? result.error : JSON.stringify(result.error),
          type: 'error'
        });
      }
    }
  };

  const renderInput = (icon, label, field, placeholder, options = {}) => {
    const isLockedField = isLocked && (field === 'priceVnd' || field === 'durationDays');
    
    return (
      <View style={styles.inputWrapper}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.inputLabel, { marginBottom: 0 }]}>{label}</Text>
          {isLockedField && <Lock size={14} color={COLORS.warning} style={{ marginLeft: 6 }} />}
        </View>
        <View style={[
          styles.inputContainer, 
          options.multiline && { height: 120, alignItems: 'flex-start', paddingTop: 12 },
          isLockedField && { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'transparent' }
        ]}>
          <View style={[styles.iconBox, options.multiline && { marginTop: 0 }]}>
            {icon}
          </View>
          <TextInput
            style={[
              styles.input, 
              options.multiline && { height: 100, textAlignVertical: 'top' },
              isLockedField && { color: '#A0AEC0' }
            ]}
            placeholder={placeholder}
            placeholderTextColor="#A0AEC0"
            value={formData[field]}
            onChangeText={(val) => handleChange(field, val)}
            keyboardType={options.keyboardType || 'default'}
            multiline={options.multiline || false}
            editable={!isLockedField}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Sửa thông tin' : 'Tạo khóa học mới'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

            {/* Thumbnail Upload */}
            <Text style={styles.inputLabel}>Ảnh bìa khóa học</Text>
            <TouchableOpacity style={styles.thumbnailContainer} onPress={handlePickThumbnail}>
              {thumbnailUri ? (
                <Image source={{ uri: thumbnailUri }} style={styles.thumbnailImage} />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <UploadCloud size={32} color="#A0AEC0" />
                  <Text style={styles.thumbnailPlaceholderText}>Chọn ảnh bìa (Tỷ lệ 16:9)</Text>
                </View>
              )}
              <View style={styles.editThumbOverlay}>
                <Edit3 size={16} color="#2D3748" />
              </View>
            </TouchableOpacity>
            <View style={{ height: 20 }} />
            
            {renderInput(
              <Edit3 size={20} color={COLORS.primary} />, 
              "Tên khóa học *", 
              "title", 
              "VD: Giảm cân thần tốc 30 ngày"
            )}

            {renderInput(
              <AlignLeft size={20} color={COLORS.primary} />, 
              "Mô tả chi tiết", 
              "description", 
              "Giới thiệu khóa học của bạn...",
              { multiline: true }
            )}

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                {renderInput(
                  <DollarSign size={20} color="#F1C40F" />, 
                  "Giá bán (VNĐ) *", 
                  "priceVnd", 
                  "VD: 500000",
                  { keyboardType: 'numeric' }
                )}
              </View>
              <View style={styles.halfInput}>
                {renderInput(
                  <Clock size={20} color="#3498DB" />, 
                  "Thời lượng (Ngày) *", 
                  "durationDays", 
                  "VD: 30",
                  { keyboardType: 'numeric' }
                )}
              </View>
            </View>

            {renderInput(
              <Tag size={20} color="#9B59B6" />, 
              "Tags (bắt buộc, cách nhau bởi dấu phẩy) *", 
              "tags", 
              "VD: giam_can, tang_co"
            )}

            {renderInput(
              <PlayCircle size={20} color="#FF0000" />, 
              "ID Video Youtube (Video Giới Thiệu)", 
              "youtubeVideoId", 
              "VD: dQw4w9WgXcQ (Để trống nếu không có)"
            )}

          </View>

          <NutriButton 
            title={(isLoading || isUploadingThumb) ? "ĐANG XỬ LÝ..." : (isEditMode ? "LƯU THAY ĐỔI" : "TIẾP TỤC")} 
            onPress={handleSave}
            style={styles.saveBtn}
            disabled={isLoading || isUploadingThumb || isArchived}
          />
          
          {isArchived && (
            <NutriButton 
              title="KHÔI PHỤC KHÓA HỌC" 
              onPress={handleRestore}
              style={[styles.saveBtn, { backgroundColor: COLORS.success, marginTop: 15 }]}
              disabled={isLoading || isUploadingThumb}
            />
          )}

          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A202C',
    textTransform: 'uppercase',
  },
  content: {
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#2D4A33',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A202C',
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 8,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 56,
    paddingHorizontal: 16,
  },
  iconBox: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#1A202C',
    fontSize: 16,
    height: '100%',
    fontWeight: '600',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  saveBtn: {
    marginTop: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  thumbnailContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailPlaceholderText: {
    color: '#A0AEC0',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600'
  },
  editThumbOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  }
});

export default CourseMetaScreen;
