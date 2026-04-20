<template>
  <div class="min-h-32 flex flex-wrap gap-x-4 gap-y-3 justify-center items-center p-4">
    <span
      v-if="Object.keys(words).length === 0"
      class="text-purple-300 text-sm"
    >
      Waiting for responses...
    </span>
    <TransitionGroup name="word">
      <span
        v-for="[word, count] in sortedWords"
        :key="word"
        :style="{
          fontSize: fontSize(count) + 'px',
          color: wordColor(count),
          lineHeight: '1.2',
          fontWeight: count > maxCount * 0.6 ? '700' : '500',
        }"
        class="font-display transition-all duration-500 cursor-default select-none"
        :title="`${count} ${count === 1 ? 'response' : 'responses'}`"
      >
        {{ word }}
      </span>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  words: Record<string, number>
}>()

const purpleShades = [
  '#9b6fd4',
  '#6B3FA0',
  '#4e2d78',
  '#b88aff',
  '#7c3aed',
  '#a855f7',
]

const sortedWords = computed(() =>
  Object.entries(props.words).sort((a, b) => b[1] - a[1])
)

const maxCount = computed(() =>
  Math.max(1, ...Object.values(props.words))
)

function fontSize(count: number): number {
  const min = 14
  const max = 52
  const ratio = count / maxCount.value
  return Math.round(min + (max - min) * Math.sqrt(ratio))
}

function wordColor(count: number): string {
  const ratio = count / maxCount.value
  const index = Math.min(
    Math.floor(ratio * purpleShades.length),
    purpleShades.length - 1
  )
  return purpleShades[index]
}
</script>

<style scoped>
.word-enter-active {
  transition: all 0.4s ease;
}
.word-enter-from {
  opacity: 0;
  transform: scale(0.5);
}
</style>
