import { ref } from 'vue';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

const toasts = ref<Toast[]>([]);
let toastIdCounter = 0;

export function useToast() {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = toastIdCounter++;
    const newToast = { ...toast, id };
    toasts.value.push(newToast);
    
    setTimeout(() => {
      removeToast(id);
    }, toast.duration);
    
    return id;
  };
  
  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(toast => toast.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };
  
  const success = (message: string, duration = 3000) => {
    return addToast({ message, type: 'success', duration });
  };
  
  const error = (message: string, duration = 4000) => {
    return addToast({ message, type: 'error', duration });
  };
  
  const info = (message: string, duration = 3000) => {
    return addToast({ message, type: 'info', duration });
  };
  
  const warning = (message: string, duration = 3500) => {
    return addToast({ message, type: 'warning', duration });
  };
  
  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  };
}