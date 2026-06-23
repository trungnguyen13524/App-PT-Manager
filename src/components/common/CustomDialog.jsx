import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react-native';
import { useDialogStore } from '../../store/dialogStore';
import { COLORS, TYPOGRAPHY } from '../../theme';

const CustomDialog = () => {
  const { isVisible, title, message, type, buttons, hideDialog } = useDialogStore();

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle color={COLORS.success} size={48} />;
      case 'error':
        return <AlertCircle color={COLORS.error} size={48} />;
      case 'warning':
        return <AlertTriangle color={COLORS.warning} size={48} />;
      case 'info':
      default:
        return <Info color={COLORS.info} size={48} />;
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'error':
        return COLORS.error;
      case 'success':
        return COLORS.success;
      case 'warning':
        return COLORS.warning;
      case 'info':
      default:
        return COLORS.text;
    }
  };

  const handleButtonPress = (onPress) => {
    hideDialog();
    if (onPress) {
      // Allow modal hide animation to start before executing action
      setTimeout(() => onPress(), 100);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={isVisible} onRequestClose={hideDialog}>
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          <View style={styles.iconContainer}>{getIcon()}</View>
          
          <Text style={[styles.title, { color: getTitleColor() }]}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.buttonContainer}>
            {buttons.map((btn, index) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    isCancel ? styles.cancelButton : styles.primaryButton,
                    isDestructive && styles.destructiveButton,
                    buttons.length > 1 && { flex: 1, marginLeft: index === 0 ? 0 : 12 }
                  ]}
                  onPress={() => handleButtonPress(btn.onPress)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isCancel ? styles.cancelButtonText : styles.primaryButtonText,
                    ]}
                  >
                    {btn.text || 'OK'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    ...TYPOGRAPHY.h3,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  destructiveButton: {
    backgroundColor: COLORS.error,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: 16,
  },
});

export default CustomDialog;
