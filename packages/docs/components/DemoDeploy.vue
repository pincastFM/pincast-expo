<template>
  <div class="terminal-demo bg-gray-900 rounded-lg overflow-hidden shadow-xl my-6">
    <div class="flex items-center justify-between px-4 py-2 bg-gray-800">
      <div class="flex space-x-2">
        <span class="h-3 w-3 bg-red-500 rounded-full"></span>
        <span class="h-3 w-3 bg-yellow-500 rounded-full"></span>
        <span class="h-3 w-3 bg-green-500 rounded-full"></span>
      </div>
      <div class="text-xs text-gray-400">
        {{ title }}
      </div>
      <div class="flex space-x-2">
        <button @click="copyCommand" class="text-gray-400 hover:text-white">
          <IconCopy class="h-4 w-4" />
        </button>
      </div>
    </div>
    
    <div class="terminal-content font-mono text-sm p-4 leading-relaxed text-gray-300 max-h-80 overflow-y-auto">
      <div class="flex">
        <span class="text-green-400 mr-2">$</span>
        <span class="text-blue-400">{{ command }}</span>
      </div>
      
      <div v-if="isShowing" class="mt-2">
        <div v-for="(line, index) in outputLines" :key="index" class="terminal-line" :class="line.type">
          {{ line.text }}
        </div>
      </div>
      
      <div v-if="isShowing && isComplete" class="text-green-400 mt-4">
        ✓ Deployment complete! View at: 
        <a :href="demoUrl" target="_blank" class="text-blue-400 underline">{{ demoUrl }}</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Terminal'
  },
  command: {
    type: String,
    default: 'pincast deploy'
  },
  output: {
    type: Array as () => Array<{text: string, type?: string}>,
    default: () => []
  },
  demoUrl: {
    type: String,
    default: 'https://demo.pincast.fm/zombie-run'
  },
  autoStart: {
    type: Boolean,
    default: false
  }
})

const isShowing = ref(false)
const currentLineIndex = ref(0)
const isComplete = ref(false)

const outputLines = computed(() => {
  if (currentLineIndex.value === 0) return []
  return props.output.slice(0, currentLineIndex.value)
})

// Copy command to clipboard
function copyCommand() {
  navigator.clipboard.writeText(props.command)
  // Could add toast notification here
}

// Start the animation
function startAnimation() {
  if (isShowing.value) return
  isShowing.value = true
  currentLineIndex.value = 0
  isComplete.value = false
  
  // Animate the log lines
  const timer = setInterval(() => {
    if (currentLineIndex.value < props.output.length) {
      currentLineIndex.value++
    } else {
      clearInterval(timer)
      isComplete.value = true
    }
  }, 150)
}

onMounted(() => {
  if (props.autoStart) {
    setTimeout(startAnimation, 800)
  }
})

// Expose the startAnimation method
defineExpose({
  startAnimation
})
</script>

<script>
// Add dynamic component for the copy icon
export default {
  components: {
    IconCopy: {
      render() {
        return h('svg', {
          xmlns: 'http://www.w3.org/2000/svg',
          width: '1em',
          height: '1em',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        }, [
          h('rect', { x: '9', y: '9', width: '13', height: '13', rx: '2', ry: '2' }),
          h('path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' })
        ])
      }
    }
  }
}
</script>

<style scoped>
.terminal-line {
  white-space: pre-wrap;
  word-break: break-all;
}

.terminal-line.info {
  color: #9ca3af;
}

.terminal-line.success {
  color: #34d399;
}

.terminal-line.warning {
  color: #fbbf24;
}

.terminal-line.error {
  color: #f87171;
}

.terminal-line.highlight {
  color: #60a5fa;
}
</style>