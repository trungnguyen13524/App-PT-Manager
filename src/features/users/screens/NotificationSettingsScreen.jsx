import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, MessageSquare, Coffee, Dumbbell } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { COLORS, TYPOGRAPHY } from '../../../theme';
import { AbstractBackground } from '../../../components/common';
import NutriButton from '../../../components/shared/NutriButton';
import { useDialogStore } from '../../../store/dialogStore';

const SETTINGS_KEY = 'notification_settings_v1';

const NotificationSettingsScreen = () => {
  const navigation = useNavigation();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    pushEnabled: true,
    ptMessages: true,
    mealReminders: true,
    workoutReminders: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await SecureStore.getItemAsync(SETTINGS_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load notification settings', e);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(settings));
      useDialogStore.getState().showDialog({
        title: 'Thành công',
        message: 'Đã lưu cài đặt thông báo.',
        type: 'success',
      });
    } catch (e) {
      useDialogStore.getState().showDialog({
        title: 'Lỗi',
        message: 'Không thể lưu cài đặt, vui lòng thử lại.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const SettingRow = ({ icon: Icon, title, description, value, onToggle, disabled = false }) => (
    <View style={[styles.settingRow, disabled && { opacity: 0.5 }]}>
      <View style={styles.settingIcon}>
        <Icon size={22} color={COLORS.primary} />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description ? <Text style={styles.settingDescription}>{description}</Text> : null}
      </View>
      <Switch
        trackColor={{ false: 'rgba(0, 0, 0, 0.05)', true: COLORS.primary }}
        thumbColor={'#2D3748'}
        ios_backgroundColor="rgba(0, 0, 0, 0.05)"
        onValueChange={onToggle}
        value={value}
        disabled={disabled}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <AbstractBackground />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#2D3748" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt thông báo</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông báo chung</Text>
          <SettingRow 
            icon={Bell}
            title="Cho phép thông báo"
            description="Tắt mục này sẽ chặn toàn bộ thông báo từ ứng dụng"
            value={settings.pushEnabled}
            onToggle={() => toggleSetting('pushEnabled')}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chi tiết thông báo</Text>
          <SettingRow 
            icon={MessageSquare}
            title="Tin nhắn từ Huấn luyện viên"
            description="Nhận thông báo khi PT gửi tin nhắn hoặc nhận xét"
            value={settings.ptMessages}
            onToggle={() => toggleSetting('ptMessages')}
            disabled={!settings.pushEnabled}
          />
          <View style={styles.divider} />
          <SettingRow 
            icon={Coffee}
            title="Nhắc nhở bữa ăn"
            description="Thông báo nhắc bạn ghi chép bữa ăn đúng giờ"
            value={settings.mealReminders}
            onToggle={() => toggleSetting('mealReminders')}
            disabled={!settings.pushEnabled}
          />
          <View style={styles.divider} />
          <SettingRow 
            icon={Dumbbell}
            title="Nhắc nhở tập luyện"
            description="Nhắc nhở lịch tập luyện hàng ngày của bạn"
            value={settings.workoutReminders}
            onToggle={() => toggleSetting('workoutReminders')}
            disabled={!settings.pushEnabled}
          />
        </View>

        <NutriButton
          title={isSaving ? "Đang lưu..." : "Lưu cài đặt"}
          onPress={saveSettings}
          disabled={isSaving}
          style={styles.saveBtn}
        />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: '#2D3748',
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A5568',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(85, 107, 47, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    marginVertical: 12,
  },
  saveBtn: {
    marginTop: 12,
    marginBottom: 40,
  }
});

export default NotificationSettingsScreen;
