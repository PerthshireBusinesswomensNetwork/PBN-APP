<template>
  <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
    <p class="text-sm text-red-600 font-medium mb-3">{{ message }}</p>
    <div class="flex gap-2">
      <button
        class="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
        @click="emit('confirm')"
      >
        Yes, continue
      </button>
      <button
        class="flex-1 py-2 border border-red-200 text-red-400 rounded-lg text-sm font-semibold hover:bg-white transition-colors"
        @click="emit('cancel')"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ message: string }>()
const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>
