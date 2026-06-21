import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Alert,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';

// Component con để render Video bằng hooks một cách an toàn
const LessonVideoPreview = ({ videoUri }) => {
  const player = useVideoPlayer(videoUri, player => {
    player.loop = false;
    player.pause();
  });

  if (!videoUri) return null;

  return (
    <View style={{ width: '100%', height: 200, borderRadius: 8, overflow: 'hidden', marginTop: 12 }}>
      <VideoView style={{ width: '100%', height: '100%' }} player={player} allowsPictureInPicture />
    </View>
  );
};
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Plus, ChevronDown, ChevronUp, Video, Save, Trash2, Edit3, ArrowUp, ArrowDown, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriButton from '../../../components/shared/NutriButton';
import ptService from '../../../api/services/pt.service';
import { usePTStore } from '../../../store/ptStore';
import { useDialogStore } from '../../../store/dialogStore';

const CurriculumBuilderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [course, setCourse] = useState(null);
  
  // Local state cho curriculum
  const [modules, setModules] = useState([]);
  
  // Ref để scrollTo lỗi
  const scrollViewRef = useRef(null);
  const lessonRefs = useRef({});

  useEffect(() => {
    fetchCourseDetail();
  }, []);

  const fetchCourseDetail = async () => {
    try {
      setIsLoading(true);
      const res = await ptService.getCourseDetail(courseId);
      setCourse(res.data);
      // Sắp xếp modules và lessons theo displayOrder
      const sortedModules = (res.data?.modules || []).map(m => ({
        ...m,
        isExpanded: true,
        lessons: (m.lessons || []).sort((a, b) => a.displayOrder - b.displayOrder)
      })).sort((a, b) => a.displayOrder - b.displayOrder);
      
      setModules(sortedModules);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải chi tiết khóa học.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- QUẢN LÝ MODULE ---
  const addModule = () => {
    setModules(prev => [
      ...prev,
      {
        id: `temp_mod_${Date.now()}`,
        title: `Chương ${prev.length + 1}`,
        displayOrder: prev.length,
        lessons: [],
        isExpanded: true
      }
    ]);
  };

  const updateModuleTitle = (modIndex, text) => {
    const newMods = [...modules];
    newMods[modIndex].title = text;
    setModules(newMods);
  };

  const removeModule = (modIndex) => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa chương này?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Xóa', 
        style: 'destructive',
        onPress: () => {
          const newMods = [...modules];
          newMods.splice(modIndex, 1);
          reorderItems(newMods);
          setModules(newMods);
        }
      }
    ]);
  };

  const toggleModule = (modIndex) => {
    const newMods = [...modules];
    newMods[modIndex].isExpanded = !newMods[modIndex].isExpanded;
    setModules(newMods);
  };

  // --- QUẢN LÝ LESSON ---
  const addLesson = (modIndex) => {
    const newMods = [...modules];
    const newLesson = {
      id: `temp_les_${Date.now()}`,
      title: `Bài học ${newMods[modIndex].lessons.length + 1}`,
      content: '',
      displayOrder: newMods[modIndex].lessons.length,
      youtubeVideoId: '',
      videoUrl: '', // Cloudinary (chỉ đọc hoặc đánh dấu sau khi upload)
      isPreview: false,
      _isError: false
    };
    newMods[modIndex].lessons.push(newLesson);
    setModules(newMods);
  };

  const updateLesson = (modIndex, lesIndex, field, value) => {
    const newMods = [...modules];
    
    // Auto extract YouTube ID
    if (field === 'youtubeVideoId' && value.includes('youtu')) {
      const regex = /(?:v=|youtu\.be\/|embed\/)([^&?\n]+)/;
      const match = value.match(regex);
      if (match && match[1]) {
        value = match[1].substring(0, 11);
      }
    }

    newMods[modIndex].lessons[lesIndex][field] = value;
    newMods[modIndex].lessons[lesIndex]._isError = false; // Xóa lỗi khi gõ
    setModules(newMods);
  };

  const removeLesson = (modIndex, lesIndex) => {
    const newMods = [...modules];
    newMods[modIndex].lessons.splice(lesIndex, 1);
    reorderItems(newMods[modIndex].lessons);
    setModules(newMods);
  };

  const handleTogglePreview = (modIndex, lesIndex, lessonId, val) => {
    // Chỉ cập nhật state nội bộ để UI mượt. Sự thay đổi sẽ được đẩy lên server
    // thông qua hàm updateCurriculum khi người dùng nhấn "LƯU GIÁO TRÌNH"
    // vì API PATCH /preview của Backend hiện đang bị lỗi 500 Internal Server Error.
    updateLesson(modIndex, lesIndex, 'isPreview', val);
  };

  // --- ĐỔI THỨ TỰ (Sử dụng mũi tên thay vì Kéo thả để nhẹ mượt) ---
  const reorderItems = (list) => {
    list.forEach((item, index) => {
      item.displayOrder = index;
    });
  };

  const moveModule = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === modules.length - 1)) return;
    const newMods = [...modules];
    const temp = newMods[index];
    newMods[index] = newMods[index + direction];
    newMods[index + direction] = temp;
    reorderItems(newMods);
    setModules(newMods);
  };

  const moveLesson = (modIndex, lesIndex, direction) => {
    const newMods = [...modules];
    const lessons = newMods[modIndex].lessons;
    if ((direction === -1 && lesIndex === 0) || (direction === 1 && lesIndex === lessons.length - 1)) return;
    
    const temp = lessons[lesIndex];
    lessons[lesIndex] = lessons[lesIndex + direction];
    lessons[lesIndex + direction] = temp;
    reorderItems(lessons);
    setModules(newMods);
  };

  // --- UPLOAD VIDEO MP4 ---
  const handleUploadVideo = async (modIndex, lesIndex, lessonId) => {
    if (String(lessonId).startsWith('temp_')) {
      useDialogStore.getState().showDialog({
        title: 'Cần lưu giáo trình trước',
        message: 'Bạn cần bấm LƯU GIÁO TRÌNH trước khi tải Video lên bài học mới này.',
        type: 'warning'
      });
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Kiểm tra dung lượng (ước tính)
        if (file.fileSize && file.fileSize > 100 * 1024 * 1024) {
          useDialogStore.getState().showDialog({
            title: 'File quá lớn',
            message: 'Dung lượng video không được vượt quá 100MB.',
            type: 'error'
          });
          return;
        }

        // Tự động tải lên máy chủ luôn cho mượt
        confirmUploadVideo(modIndex, lesIndex, lessonId, file.uri);
      }
    } catch (error) {
      useDialogStore.getState().showDialog({
        title: 'Lỗi',
        message: 'Lỗi chọn video: ' + error.message,
        type: 'error'
      });
    }
  };

  // --- XÁC NHẬN TẢI VIDEO LÊN CLOUD ---
  const confirmUploadVideo = async (modIndex, lesIndex, lessonId, localUri) => {
    try {
      useDialogStore.getState().showDialog({
        title: 'Đang tải lên',
        message: 'Video đang được tải lên hệ thống. Vui lòng chờ...',
        type: 'success'
      });

      const formData = new FormData();
      formData.append('video', {
        uri: localUri,
        name: `video_${lessonId}.mp4`,
        type: 'video/mp4',
      });

      const uploadRes = await ptService.uploadLessonVideo(courseId, lessonId, formData);
      
      const findUrl = (obj) => {
        if (!obj) return null;
        if (typeof obj === 'string' && obj.startsWith('http')) return obj;
        if (typeof obj === 'object') {
          // Ưu tiên các key có chữ 'video'
          for (let key in obj) {
            if (key.toLowerCase().includes('video') && typeof obj[key] === 'string' && obj[key].startsWith('http')) return obj[key];
          }
          // Sau đó mới lấy các key có chữ 'url'
          for (let key in obj) {
            if (key.toLowerCase().includes('url') && typeof obj[key] === 'string' && obj[key].startsWith('http')) return obj[key];
          }
          for (let key in obj) {
            const res = findUrl(obj[key]);
            if (res) return res;
          }
        }
        return null;
      };
      
      let cloudUrl = findUrl(uploadRes.data);

      // Nếu API trả về không có URL, poll getCourseDetail 3 lần để đợi DB cập nhật
      if (!cloudUrl) {
        for (let i = 0; i < 3; i++) {
          const res = await ptService.getCourseDetail(courseId);
          const srvMod = res.data?.modules?.find(m => m.id === modules[modIndex].id);
          const srvLes = srvMod?.lessons?.find(l => l.id === lessonId);
          if (srvLes && srvLes.videoUrl && srvLes.videoUrl.startsWith('http')) {
            cloudUrl = srvLes.videoUrl;
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (cloudUrl) {
        updateLesson(modIndex, lesIndex, 'videoUrl', cloudUrl);
        updateLesson(modIndex, lesIndex, 'localVideoUri', null);
        
        useDialogStore.getState().showDialog({
          title: 'Tải lên hoàn tất',
          message: 'Đang tiến hành lưu giáo trình tự động...',
          type: 'success'
        });

        // Xây dựng payload với dữ liệu MỚI NHẤT để tránh lỗi closure
        const newMods = JSON.parse(JSON.stringify(modules));
        newMods[modIndex].lessons[lesIndex].videoUrl = cloudUrl;
        newMods[modIndex].lessons[lesIndex].localVideoUri = null;
        
        const payload = {
          modules: newMods.map(m => ({
            id: String(m.id).startsWith('temp_') ? undefined : m.id,
            title: m.title,
            displayOrder: m.displayOrder,
            lessons: m.lessons.map(l => ({
              id: String(l.id).startsWith('temp_') ? undefined : l.id,
              title: l.title,
              content: l.content,
              displayOrder: l.displayOrder,
              youtubeVideoId: l.youtubeVideoId ? l.youtubeVideoId : undefined,
              videoUrl: l.videoUrl || undefined,
              duration: l.duration || 0,
              isPreview: l.isPreview
            }))
          }))
        };
        
        try {
          // KHÔNG GỌI updateCurriculum Ở ĐÂY NỮA VÌ NÓ SẼ LÀM BACKEND XÓA MẤT VIDEO!
          // Upload API đã tự lưu vào DB rồi.
          useDialogStore.getState().showDialog({
            title: 'Thành công',
            message: 'Video đã được tải lên Cloud và lưu thành công.',
            type: 'success'
          });
        } catch (err) {
          useDialogStore.getState().showDialog({
            title: 'Lỗi',
            message: 'Tải video thành công nhưng không thể tự động lưu giáo trình. Vui lòng bấm nút Lưu Giáo Trình ở dưới cùng.',
            type: 'warning'
          });
        }

      } else {
        throw new Error('Không thể lấy được đường dẫn video từ máy chủ sau khi tải lên. Vui lòng thử lại.');
      }

      
    } catch (error) {
      useDialogStore.getState().showDialog({
        title: 'Lỗi',
        message: 'Tải video thất bại: ' + (error.response?.data?.error?.message || error.message),
        type: 'error'
      });
    }
  };

  // --- LƯU GIÁO TRÌNH ---
  const handleSaveCurriculum = async () => {
    const hasCloudVideo = modules.some(m => m.lessons.some(l => l.videoUrl && l.videoUrl.startsWith('http')));
    if (hasCloudVideo) {
      return Alert.alert(
        'Cảnh báo dữ liệu',
        'Việc Lưu Giáo Trình sẽ làm XÓA SẠCH toàn bộ các video bạn đã tải lên Cloudinary trước đó. Bạn có chắc chắn muốn Lưu và tải lại toàn bộ video không?',
        [
          { text: 'Hủy bỏ', style: 'cancel' },
          { 
            text: 'Vẫn Lưu (Mất Video)', 
            style: 'destructive',
            onPress: () => performSaveCurriculum()
          }
        ]
      );
    }
    performSaveCurriculum();
  };

  const performSaveCurriculum = async () => {
    setIsSaving(true);
    try {
      // Chuẩn bị payload (loại bỏ các cờ tạm thời như isExpanded, _isError, v.v.)
      const payload = {
        modules: modules.map(m => ({
          id: String(m.id).startsWith('temp_') ? undefined : m.id,
          title: m.title,
          displayOrder: m.displayOrder,
          lessons: m.lessons.map(l => ({
            id: String(l.id).startsWith('temp_') ? undefined : l.id,
            title: l.title,
            content: l.content,
            displayOrder: l.displayOrder,
            youtubeVideoId: l.youtubeVideoId || undefined,
            videoUrl: l.videoUrl || undefined,
            duration: Number(l.duration) || 0,
            isPreview: !!l.isPreview
          }))
        }))
      };

      await ptService.updateCurriculum(courseId, payload);
      useDialogStore.getState().showDialog({
        title: 'Đã lưu',
        message: 'Giáo trình đã được cập nhật thành công.',
        type: 'success'
      });
      // Refresh to get real IDs for new lessons
      fetchCourseDetail();
    } catch (error) {
      useDialogStore.getState().showDialog({
        title: 'Lỗi',
        message: error.response?.data?.error?.message || 'Không thể lưu giáo trình.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // --- XUẤT BẢN KHÓA HỌC (Publishing Guard) ---
  const handlePublish = async () => {
    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
    if (totalLessons === 0) {
      useDialogStore.getState().showDialog({
        title: 'Giáo trình trống',
        message: 'Khóa học chưa có bài học nào. Vui lòng thêm bài học trước khi xuất bản.',
        type: 'error'
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // BƯỚC 2: Gọi lệnh Publish (Không gọi updateCurriculum ở đây nữa vì nó xóa video cloud)
      const { publishCourse } = usePTStore.getState();
      const result = await publishCourse(courseId);
      
      if (result.success) {
        useDialogStore.getState().showDialog({
          title: 'Thành công',
          message: 'Khóa học đã được XUẤT BẢN và sẵn sàng để học viên đăng ký!',
          type: 'success',
          buttons: [{ text: 'OK', onPress: () => navigation.goBack() }]
        });
      } else {
        // Bắt lỗi CURRICULUM_INCOMPLETE
        if (result.payload && result.payload.code === 'CURRICULUM_INCOMPLETE' && result.payload.details) {
          const incompleteLessonIds = result.payload.details.map(d => d.lessonId);
          
          // Đánh dấu lỗi đỏ trên giao diện
          let firstErrorY = 0;
          const newMods = [...modules];
          newMods.forEach((m, mIdx) => {
            let modHasError = false;
            m.lessons.forEach((l, lIdx) => {
              if (incompleteLessonIds.includes(l.id)) {
                l._isError = true;
                modHasError = true;
                // Lưu tọa độ ước tính hoặc dùng reference để scroll
              }
            });
            if (modHasError) m.isExpanded = true;
          });
          setModules(newMods);

          useDialogStore.getState().showDialog({
            title: 'Lỗi xuất bản',
            message: 'Một số bài học chưa có video (YouTube hoặc Upload trực tiếp). Vui lòng cập nhật các bài học bị đỏ.',
            type: 'error'
          });
        } else {
          useDialogStore.getState().showDialog({
            title: 'Lỗi',
            message: result.error || 'Lỗi hệ thống khi xuất bản.',
            type: 'error'
          });
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Soạn Giáo Trình</Text>
        <TouchableOpacity onPress={handleSaveCurriculum} disabled={isSaving}>
          {isSaving ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Save size={24} color={COLORS.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false}>
        {modules.map((module, mIdx) => (
          <View key={module.id} style={styles.moduleCard}>
            {/* Module Header */}
            <View style={styles.moduleHeader}>
              <TouchableOpacity onPress={() => toggleModule(mIdx)} style={styles.moduleExpander}>
                {module.isExpanded ? <ChevronUp size={20} color="#FFF" /> : <ChevronDown size={20} color="#FFF" />}
              </TouchableOpacity>
              
              <TextInput
                style={styles.moduleTitleInput}
                value={module.title}
                onChangeText={(text) => updateModuleTitle(mIdx, text)}
                placeholder="Tên chương..."
                placeholderTextColor="rgba(255,255,255,0.4)"
              />

              <View style={styles.moduleActions}>
                <TouchableOpacity onPress={() => moveModule(mIdx, -1)} disabled={mIdx === 0} style={{ padding: 4 }}>
                  <ArrowUp size={18} color={mIdx === 0 ? "rgba(255,255,255,0.2)" : COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => moveModule(mIdx, 1)} disabled={mIdx === modules.length - 1} style={{ padding: 4 }}>
                  <ArrowDown size={18} color={mIdx === modules.length - 1 ? "rgba(255,255,255,0.2)" : COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeModule(mIdx)} style={{ padding: 4, marginLeft: 8 }}>
                  <Trash2 size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Lessons */}
            {module.isExpanded && (
              <View style={styles.lessonContainer}>
                {module.lessons.map((lesson, lIdx) => (
                  <View 
                    key={lesson.id} 
                    style={[
                      styles.lessonCard,
                      lesson._isError && styles.lessonError
                    ]}
                  >
                    <View style={styles.lessonHeaderRow}>
                      <Text style={styles.lessonLabel}>Bài {lIdx + 1}:</Text>
                      <TextInput
                        style={styles.lessonTitleInput}
                        value={lesson.title}
                        onChangeText={(text) => updateLesson(mIdx, lIdx, 'title', text)}
                        placeholder="Tiêu đề bài học..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                      />
                      <View style={styles.lessonActions}>
                        <TouchableOpacity onPress={() => moveLesson(mIdx, lIdx, -1)} disabled={lIdx === 0}>
                          <ArrowUp size={16} color={lIdx === 0 ? "rgba(255,255,255,0.2)" : "#FFF"} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => moveLesson(mIdx, lIdx, 1)} disabled={lIdx === module.lessons.length - 1} style={{ marginLeft: 8 }}>
                          <ArrowDown size={16} color={lIdx === module.lessons.length - 1 ? "rgba(255,255,255,0.2)" : "#FFF"} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => removeLesson(mIdx, lIdx)} style={{ marginLeft: 12 }}>
                          <Trash2 size={16} color={COLORS.error} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Video Sources */}
                    <Text style={styles.subLabel}>Nguồn Video:</Text>
                    
                    <View style={styles.videoSourceRow}>
                      <View style={styles.youtubeInputContainer}>
                        <TextInput
                          style={styles.youtubeInput}
                          value={lesson.youtubeVideoId}
                          onChangeText={(text) => updateLesson(mIdx, lIdx, 'youtubeVideoId', text)}
                          placeholder="Link YouTube hoặc Video ID (11 ký tự)"
                          placeholderTextColor="rgba(255,255,255,0.3)"
                        />
                      </View>
                    </View>

                    <View style={styles.dividerRow}>
                      <View style={styles.divider} />
                      <Text style={styles.orText}>HOẶC</Text>
                      <View style={styles.divider} />
                    </View>

                    <View style={styles.uploadRow}>
                      <TouchableOpacity 
                        style={[styles.uploadBtn, (lesson.videoUrl || lesson.localVideoUri) && { borderColor: COLORS.success }]}
                        onPress={() => handleUploadVideo(mIdx, lIdx, lesson.id)}
                      >
                        <Video size={18} color={(lesson.videoUrl || lesson.localVideoUri) ? COLORS.success : COLORS.primary} style={{ marginRight: 8 }} />
                        <Text style={[styles.uploadText, (lesson.videoUrl || lesson.localVideoUri) && { color: COLORS.success }]}>
                          {lesson.videoUrl ? "Đã tải Video MP4" : (lesson.localVideoUri ? "Đang tải lên..." : "Chọn Video (MP4 < 100MB)")}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Hiển thị Video Preview nếu đã chọn video hoặc đã có videoUrl */}
                    {(lesson.videoUrl || lesson.localVideoUri) && (
                      <LessonVideoPreview videoUri={lesson.localVideoUri || lesson.videoUrl} />
                    )}

                    {/* Khóa học Demo Toggle */}
                    <View style={styles.previewToggleRow}>
                      <Text style={styles.previewToggleLabel}>Đánh dấu là Video Demo (Học viên xem thử miễn phí)</Text>
                      <Switch 
                        value={lesson.isPreview}
                        onValueChange={(val) => handleTogglePreview(mIdx, lIdx, lesson.id, val)}
                        trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.primaryLight }}
                        thumbColor={lesson.isPreview ? COLORS.primary : '#f4f3f4'}
                      />
                    </View>

                    {lesson._isError && (
                      <Text style={styles.errorText}>* Bài học này chưa có nguồn Video.</Text>
                    )}
                  </View>
                ))}

                <TouchableOpacity style={styles.addLessonBtn} onPress={() => addLesson(mIdx)}>
                  <Plus size={16} color={COLORS.primary} />
                  <Text style={styles.addLessonText}>Thêm bài học</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.addModuleBtn} onPress={addModule}>
          <Plus size={20} color={COLORS.primary} />
          <Text style={styles.addModuleText}>THÊM CHƯƠNG MỚI</Text>
        </TouchableOpacity>

        <View style={styles.footerSpace}>
          <NutriButton 
            title={course?.status === 'PUBLISHED' ? "LƯU LẠI THAY ĐỔI" : "XUẤT BẢN KHÓA HỌC"} 
            onPress={course?.status === 'PUBLISHED' ? handleSaveCurriculum : handlePublish}
            style={{ backgroundColor: COLORS.success }}
          />
          {course?.status !== 'PUBLISHED' && (
            <Text style={styles.publishHint}>
              Hệ thống sẽ kiểm tra đảm bảo mọi bài học đều có Video trước khi xuất bản.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  content: { padding: SPACING.lg },
  moduleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  moduleExpander: { marginRight: 12 },
  moduleTitleInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    padding: 0,
  },
  moduleActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonContainer: {
    padding: 12,
  },
  lessonCard: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  lessonError: {
    borderColor: COLORS.error,
    backgroundColor: 'rgba(231, 76, 60, 0.05)',
  },
  lessonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  lessonLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    marginRight: 8,
  },
  lessonTitleInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
    padding: 0,
  },
  lessonActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
  },
  videoSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  youtubeInputContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    height: 40,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  youtubeInput: {
    color: '#FFF',
    fontSize: 13,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  divider: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  orText: { marginHorizontal: 10, color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '700' },
  uploadRow: {},
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.3)',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  uploadText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  previewToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)'
  },
  previewToggleLabel: {
    color: '#3498DB',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginRight: 10
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic'
  },
  addLessonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  addLessonText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  addModuleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.5)',
    borderStyle: 'dashed',
    marginBottom: 30,
  },
  addModuleText: {
    color: COLORS.primary,
    fontWeight: '700',
    marginLeft: 8,
  },
  footerSpace: {
    marginTop: 20,
    marginBottom: 60,
  },
  publishHint: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 10,
  }
});

export default CurriculumBuilderScreen;
