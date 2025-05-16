<template>
  <div 
    class="fixed top-4 right-4 z-50 flex flex-col gap-2"
    style="width: 100%; max-width: 400px;"
  >
    <transition-group name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="flex items-center justify-between p-4 bg-white border rounded-md shadow-primary font-mono transition-all transform hover:-translate-y-1"
        :class="toastTypeClass(toast.type)"
      >
        <div class="flex items-center">
          <div class="mr-2">
            <icon v-if="toast.type === 'success'" name="uil:check-circle" class="w-5 h-5" />
            <icon v-else-if="toast.type === 'error'" name="uil:exclamation-triangle" class="w-5 h-5" />
            <icon v-else-if="toast.type === 'warning'" name="uil:exclamation-circle" class="w-5 h-5" />
            <icon v-else name="uil:info-circle" class="w-5 h-5" />
          </div>
          <div>{{ toast.message }}</div>
        </div>
        <button 
          @click="removeToast(toast.id)" 
          class="ml-4 hover:opacity-70 transition-opacity"
        >
          <icon name="uil:times" class="w-4 h-4" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast';

const { toasts, removeToast } = useToast();

function toastTypeClass(type: string): string {
  switch (type) {
    case 'success':
      return 'border-green-500 text-green-500';
    case 'error':
      return 'border-red-500 text-red-500';
    case 'warning':
      return 'border-yellow-500 text-yellow-500';
    case 'info':
    default:
      return 'border-primary text-primary';
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>