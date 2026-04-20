<template>
  <div>
    <!-- Header row -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-display text-xl text-purple-700">
        {{ countLabel }}
      </h2>
      <span class="flex items-center gap-1.5 text-xs font-semibold text-purple-500 bg-purple-50 px-3 py-1.5 rounded-full">
        <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        Live
      </span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div
        v-for="n in 6"
        :key="n"
        class="bg-white rounded-2xl p-4 animate-pulse border border-purple-50 h-36"
      />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-12 text-red-400 text-sm">
      {{ error }}
    </div>

    <!-- Empty -->
    <div v-else-if="attendees.length === 0" class="text-center py-16 text-purple-300">
      <div class="text-5xl mb-4">👋</div>
      <p class="text-sm leading-relaxed">No one has registered yet.<br>Be the first to join the room!</p>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <button
        v-for="attendee in attendees"
        :key="attendee.id"
        class="bg-white rounded-2xl p-4 text-center shadow-sm shadow-purple-100 border border-purple-50
               hover:shadow-md hover:shadow-purple-200 hover:-translate-y-0.5 hover:border-purple-200
               transition-all duration-150 cursor-pointer"
        @click="selected = attendee"
      >
        <!-- Avatar -->
        <div class="w-14 h-14 rounded-full mx-auto mb-3 overflow-hidden bg-purple-50 border-2 border-purple-100 flex items-center justify-center">
          <img
            v-if="attendee.photo_url"
            :src="attendee.photo_url"
            :alt="attendee.name"
            class="w-full h-full object-cover"
          >
          <span v-else class="font-display text-xl text-purple-500">
            {{ initials(attendee.name) }}
          </span>
        </div>

        <p class="font-semibold text-purple-900 text-sm leading-snug mb-0.5">{{ attendee.name }}</p>
        <p class="text-purple-400 text-xs mb-2 leading-snug">{{ attendee.business }}</p>
        <span class="inline-block bg-purple-50 text-purple-500 text-[10px] font-semibold px-2.5 py-1 rounded-full">
          {{ attendee.sector }}
        </span>
      </button>
    </div>

    <!-- Profile Modal -->
    <Transition name="modal">
      <div
        v-if="selected"
        class="fixed inset-0 bg-purple-900/50 z-50 flex items-end justify-center"
        @click.self="selected = null"
      >
        <div class="bg-white rounded-t-3xl w-full max-w-lg p-7 pb-10 text-center">
          <!-- Avatar -->
          <div class="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-purple-50 border-4 border-purple-100 flex items-center justify-center">
            <img
              v-if="selected.photo_url"
              :src="selected.photo_url"
              :alt="selected.name"
              class="w-full h-full object-cover"
            >
            <span v-else class="font-display text-3xl text-purple-500">
              {{ initials(selected.name) }}
            </span>
          </div>

          <h3 class="font-display text-2xl text-purple-900 mb-1">{{ selected.name }}</h3>
          <p class="text-purple-500 text-sm mb-3">{{ selected.business }}</p>
          <span class="inline-block bg-purple-50 text-purple-500 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            {{ selected.sector }}
          </span>

          <div class="flex flex-col items-center gap-2 mb-4">
            <a
              v-if="selected.website"
              :href="normaliseUrl(selected.website)"
              target="_blank"
              rel="noopener noreferrer"
              class="text-purple-500 text-sm font-medium hover:underline"
            >
              🌐 {{ selected.website }}
            </a>
            
            <a
              v-if="selected.linkedin"
              :href="normaliseUrl(selected.linkedin)"
              target="_blank"
              rel="noopener noreferrer"
              class="text-purple-500 text-sm font-medium hover:underline"
            >
              💼 {{ selected.linkedin }}
            </a>
  
            <a
              v-if="selected.social"
              :href="normaliseUrl(selected.social)"
              target="_blank"
              rel="noopener noreferrer"
              class="text-purple-500 text-sm font-medium hover:underline"
            >
              📱 {{ selected.social }}
            </a>
          </div>
          <button
            class="mt-2 px-8 py-2.5 border border-purple-100 rounded-xl text-purple-400 text-sm font-semibold hover:bg-purple-50 transition-colors"
            @click="selected = null"
          >
            Close
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Attendee } from '~/composables/useAttendees'

const { attendees, loading, error, fetchAttendees, subscribeRealtime } = useAttendees()

const selected = ref<Attendee | null>(null)

const countLabel = computed(() => {
  const n = attendees.value.length
  if (n === 0) return 'No one yet'
  if (n === 1) return '1 person in the room'
  return `${n} people in the room`
})

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function normaliseUrl(url: string): string {
  return url.startsWith('http') ? url : `https://${url}`
}

onMounted(async () => {
  await fetchAttendees()
  const channel = subscribeRealtime()
  onUnmounted(() => { channel.unsubscribe() })
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .bg-white {
  transform: translateY(100%);
}
</style>
