<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm shadow-purple-100 border border-purple-50">
    <h2 class="font-display text-xl text-purple-700 mb-1">Admin Panel</h2>
    <p class="text-sm text-purple-400 mb-6">Organiser controls for the AGM directory.</p>

    <!-- Locked -->
    <div v-if="!unlocked">
      <div class="text-center mb-6">
        <div class="text-5xl mb-3">🔒</div>
        <p class="text-sm text-purple-400">Enter the admin PIN to continue.</p>
      </div>
      <div class="mb-3">
        <input
          v-model="pin"
          type="password"
          placeholder="PIN"
          class="field-input text-center tracking-widest text-lg"
          @keyup.enter="unlock"
        >
      </div>
      <p v-if="pinError" class="text-red-400 text-sm text-center mb-3">{{ pinError }}</p>
      <button
        class="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-xl font-semibold text-sm tracking-wide disabled:opacity-50"
        :disabled="checking"
        @click="unlock"
      >
        {{ checking ? 'Checking...' : 'Unlock' }}
      </button>
    </div>

    <!-- Unlocked -->
    <div v-else>
      <!-- Internal tabs -->
      <div class="flex bg-purple-50 rounded-xl p-1 mb-6">
        <button
          v-for="section in sections"
          :key="section.id"
          class="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
          :class="activeSection === section.id
            ? 'bg-white text-purple-600 shadow-sm'
            : 'text-purple-400 hover:text-purple-500'"
          @click="activeSection = section.id"
        >
          {{ section.label }}
        </button>
      </div>

      <!-- ── ATTENDEES SECTION ── -->
      <div v-if="activeSection === 'attendees'">
        <div class="bg-purple-50 rounded-xl p-6 text-center mb-4">
          <div class="font-display text-5xl text-purple-500 mb-1">{{ attendees.length }}</div>
          <div class="text-sm text-purple-400">Attendees registered</div>
        </div>
        <button class="btn-outline mb-3" @click="exportAttendeesCSV">
          ⬇️ Export attendee list (CSV)
        </button>
        <button class="btn-danger" @click="confirmClearAttendees = true">
          🗑 Clear all registrations
        </button>
        <ConfirmBox
          v-if="confirmClearAttendees"
          message="Clear ALL registrations? This cannot be undone."
          @confirm="clearAttendees"
          @cancel="confirmClearAttendees = false"
        />
      </div>

      <!-- ── FEEDBACK SECTION ── -->
      <div v-else-if="activeSection === 'feedback'">

        <!-- Response count -->
        <div class="bg-purple-50 rounded-xl p-6 text-center mb-4">
          <div class="font-display text-5xl text-purple-500 mb-1">{{ responses.length }}</div>
          <div class="text-sm text-purple-400">Feedback responses</div>
        </div>

        <!-- Word cloud preview -->
        <div class="border border-purple-100 rounded-xl p-4 mb-4">
          <p class="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-2">Live word cloud</p>
          <WordCloud :words="getWordCloudData()" />
        </div>

        <!-- Export feedback -->
        <button class="btn-outline mb-3" @click="exportFeedbackCSV">
          ⬇️ Export feedback responses (CSV)
        </button>

        <!-- Clear feedback -->
        <button class="btn-danger mb-6" @click="confirmClearFeedback = true">
          🗑 Clear all feedback
        </button>
        <ConfirmBox
          v-if="confirmClearFeedback"
          message="Clear ALL feedback responses? This cannot be undone."
          @confirm="clearFeedback"
          @cancel="confirmClearFeedback = false"
        />

        <!-- Question editor -->
        <div class="border-t border-purple-100 pt-5 mt-2">
          <p class="text-sm font-semibold text-purple-700 mb-1">Edit questions</p>
          <p class="text-xs text-amber-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
            ⚠️ Edit these before the event. Changes take effect immediately.
          </p>

          <div v-if="questionsLoading" class="space-y-3">
            <div v-for="n in 5" :key="n" class="h-16 bg-purple-50 rounded-xl animate-pulse" />
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(q, index) in questions"
              :key="q.id"
              class="bg-purple-50 rounded-xl p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                  Q{{ index + 1 }}
                </span>
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="typeClass(q.question_type)"
                >
                  {{ typeLabel(q.question_type) }}
                </span>
              </div>
              <textarea
                v-model="editedQuestions[q.id]"
                rows="2"
                class="w-full px-3 py-2 border border-purple-100 rounded-lg text-sm text-purple-800 bg-white focus:outline-none focus:border-purple-400 resize-none font-sans"
              />
              <div class="flex items-center justify-between mt-2">
                <div class="flex flex-col gap-1.5">
                  <p v-if="q.question_type === 'word'" class="text-xs text-purple-400">
                    🌥 Generates the word cloud
                  </p>
                  <p v-else-if="q.options" class="text-xs text-purple-400">
                    Options: {{ q.options.join(', ') }}
                  </p>

                  <!-- Allow multiple toggle — radio questions only -->
                  <label
                    v-if="q.question_type === 'radio'"
                    class="flex items-center gap-2 cursor-pointer mt-1"
                  >
                    <div class="relative">
                      <input type="checkbox" class="sr-only" v-model="editedAllowMultiple[q.id]" />
                      <div
                        class="w-8 h-4 rounded-full transition-colors"
                        :class="editedAllowMultiple[q.id] ? 'bg-purple-500' : 'bg-purple-200'"
                      />
                      <div
                        class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform"
                        :class="editedAllowMultiple[q.id] ? 'translate-x-4' : 'translate-x-0'"
                      />
                    </div>
                    <span class="text-xs text-purple-500">Allow multiple selections</span>
                  </label>

                  <!-- Comments box toggle — all question types -->
                  <label class="flex items-center gap-2 cursor-pointer mt-1">
                    <div class="relative">
                      <input type="checkbox" class="sr-only" v-model="editedHasComments[q.id]" />
                      <div
                        class="w-8 h-4 rounded-full transition-colors"
                        :class="editedHasComments[q.id] ? 'bg-purple-500' : 'bg-purple-200'"
                      />
                      <div
                        class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform"
                        :class="editedHasComments[q.id] ? 'translate-x-4' : 'translate-x-0'"
                      />
                    </div>
                    <span class="text-xs text-purple-500">Add comments box</span>
                  </label>
                </div>

                <button
                  class="text-xs text-purple-500 font-semibold hover:text-purple-700 transition-colors"
                  :disabled="savingQuestion === q.id"
                  @click="saveQuestion(q.id)"
                >
                  {{ savingQuestion === q.id ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </div>
          </div>

          <p v-if="saveMsg" class="text-center text-sm text-purple-500 mt-3">{{ saveMsg }}</p>
        </div>
      </div>

      <p v-if="actionMsg" class="text-center text-sm text-purple-500 mt-4">{{ actionMsg }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()

// Attendees
const { attendees, fetchAttendees } = useAttendees()

// Feedback
const { questions, responses, loading: questionsLoading, fetchQuestions, fetchResponses, updateQuestion, getWordCloudData } = useFeedback()

// UI state
const pin = ref('')
const pinError = ref('')
const checking = ref(false)
const unlocked = ref(false)
const activeSection = ref<'attendees' | 'feedback'>('attendees')
const actionMsg = ref('')
const saveMsg = ref('')
const savingQuestion = ref<string | null>(null)
const confirmClearAttendees = ref(false)
const confirmClearFeedback = ref(false)

// Editable question state — keyed by question ID
const editedQuestions = ref<Record<string, string>>({})
const editedAllowMultiple = ref<Record<string, boolean>>({})
const editedHasComments = ref<Record<string, boolean>>({})

const sections = [
  { id: 'attendees', label: 'Attendees' },
  { id: 'feedback', label: 'Feedback' },
]

watch(questions, (qs) => {
  qs.forEach(q => {
    if (!editedQuestions.value[q.id]) {
      editedQuestions.value[q.id] = q.question_text
    }
    editedAllowMultiple.value[q.id] = q.allow_multiple ?? false
    editedHasComments.value[q.id] = q.has_comments ?? false
  })
})

onMounted(async () => {
  await fetchAttendees()
  await fetchQuestions()
  await fetchResponses()
})

// ---- PIN ----
async function unlock() {
  if (!pin.value) return
  checking.value = true
  pinError.value = ''
  try {
    const res = await $fetch('/api/verify-pin', { method: 'POST', body: { pin: pin.value } })
    if ((res as any).valid) {
      unlocked.value = true
    } else {
      pinError.value = 'Incorrect PIN.'
    }
  } catch {
    pinError.value = 'Could not verify PIN. Try again.'
  } finally {
    checking.value = false
  }
}

// ---- QUESTION EDITOR ----
async function saveQuestion(id: string) {
  savingQuestion.value = id
  const q = questions.value.find(q => q.id === id)
  const error = await updateQuestion(
    id,
    editedQuestions.value[id],
    q?.options ?? undefined,
    editedAllowMultiple.value[id],
    editedHasComments.value[id]
  )
  savingQuestion.value = null
  saveMsg.value = error ? 'Error saving question.' : '✓ Question saved.'
  setTimeout(() => { saveMsg.value = '' }, 3000)
  await fetchQuestions()
}

function typeLabel(type: string) {
  const map: Record<string, string> = {
    word: 'word cloud',
    rating: 'star rating',
    text: 'free text',
    radio: 'multiple choice',
  }
  return map[type] ?? type
}

function typeClass(type: string) {
  const map: Record<string, string> = {
    word: 'bg-purple-100 text-purple-600',
    rating: 'bg-amber-50 text-amber-600',
    text: 'bg-blue-50 text-blue-600',
    radio: 'bg-teal-50 text-teal-600',
  }
  return map[type] ?? 'bg-gray-100 text-gray-500'
}

// ---- ATTENDEE EXPORT ----
function exportAttendeesCSV() {
  if (attendees.value.length === 0) { actionMsg.value = 'No attendees to export yet.'; return }
  const headers = ['Name', 'Business', 'Sector', 'Website', 'LinkedIn', 'Instagram/Facebook', 'Registered At']
  const rows = attendees.value.map(a => [
    a.name, a.business, a.sector,
    (a as any).website ?? '',
    (a as any).linkedin ?? '',
    (a as any).social ?? '',
    new Date(a.created_at).toLocaleString('en-GB'),
  ])
  downloadCSV('PBWN_AGM_2025_Attendees', headers, rows)
}

async function clearAttendees() {
  const { error } = await supabase.from('attendees').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (!error) await fetchAttendees()
  confirmClearAttendees.value = false
  actionMsg.value = error ? 'Error clearing attendees.' : 'All registrations cleared.'
}

// ---- FEEDBACK EXPORT ----
function exportFeedbackCSV() {
  if (responses.value.length === 0) { actionMsg.value = 'No feedback to export yet.'; return }

  const headers = [
    'Submitted At',
    ...questions.value.flatMap((q, i) => {
      const cols = [`Q${i + 1}: ${q.question_text}`]
      if (q.has_comments) cols.push(`Q${i + 1} comments`)
      return cols
    }),
  ]

  const rows = responses.value.map(r => [
    new Date(r.created_at).toLocaleString('en-GB'),
    ...questions.value.flatMap(q => {
      const cols = [r.answers[q.id] ?? '']
      if (q.has_comments) cols.push(r.answers[`${q.id}_comments`] ?? '')
      return cols
    }),
  ])

  downloadCSV('PBWN_AGM_2025_Feedback', headers, rows)
}

async function clearFeedback() {
  const { error } = await supabase.from('feedback_responses').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (!error) await fetchResponses()
  confirmClearFeedback.value = false
  actionMsg.value = error ? 'Error clearing feedback.' : 'All feedback cleared.'
}

// ---- HELPERS ----
function downloadCSV(name: string, headers: string[], rows: (string | number)[][]) {
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.field-input {
  @apply w-full px-3.5 py-2.5 border border-purple-100 rounded-xl text-sm text-purple-800 bg-purple-50
         focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:bg-white
         transition-all font-sans;
}
.btn-outline {
  @apply w-full py-3 border border-purple-500 rounded-xl text-purple-600 text-sm font-semibold hover:bg-purple-50 transition-colors block;
}
.btn-danger {
  @apply w-full py-3 border border-red-200 rounded-xl text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors block;
}
</style>
