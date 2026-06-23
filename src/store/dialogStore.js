import { create } from 'zustand';

export const useDialogStore = create((set) => ({
  isVisible: false,
  title: '',
  message: '',
  type: 'info', // 'success', 'error', 'info', 'warning'
  buttons: [], // { text: string, onPress: function, style: 'default' | 'cancel' | 'destructive' }

  showDialog: (options) =>
    set({
      isVisible: true,
      title: options.title || '',
      message: options.message || '',
      type: options.type || 'info',
      buttons: options.buttons || [{ text: 'OK', onPress: () => {} }],
    }),

  hideDialog: () =>
    set({
      isVisible: false,
    }),
}));
