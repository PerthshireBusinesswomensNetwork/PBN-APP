<template>
  <div>
    <!-- Already submitted -->
    <div
      v-if="submitted"
      class="bg-white rounded-2xl p-8 shadow-sm border border-purple-50 text-center"
    >
      <div class="text-5xl mb-4">🎉</div>
      <h2 class="font-display text-xl text-purple-700 mb-2">Thank you!</h2>
      <p class="text-sm text-purple-400 mb-8">Your feedback helps us make every event better.</p>

      <!-- Word cloud -->
      <div class="bg-purple-50 rounded-xl p-4">
        <p class="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">
          Today in one word
        </p>
        <WordCloud :words="wordCloudData" />
        <p class="text-xs text-purple-300 mt-2">{{ responseCount }} {{ responseCount === 1 ? 'response' : 'responses' }} so far</p>
      </div>
    </div>

    <!-- Feedback form -->
    <div v-else>
      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div v-for="n in 5" :key="n" class="bg-white rounded-2xl p-5 animate-pulse h-24 border border-purple-50" />
      </div>

      <div v-else>
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-purple-50 mb-4">
          <h2 class="font-display text-xl text-purple-700 mb-1">Event Feedback</h2>
          <p class="text-sm text-purple-400">All questions are optional unless marked <span class="text-red-400">*</span></p>
        </div>

        <form @submit.prevent="submit">
          <div
            v-for="(question, index) in questions"
            :key="question.id"
            class="bg-white rounded-2xl p-5 shadow-sm border border-purple-50 mb-3"
          >
            <label class="block text-sm font-semibold text-purple-800 mb-3 leading-snug">
              <span class="text-purple-300 text-xs font-medium mr-1">{{ index + 1 }}.</span>
              {{ question.question_text }}
              <span v-if="question.required" class="text-red-400 ml-1">*</span>
            </label>

            <!-- Word input -->
            <div v-if="question.question_type === 'word'">
              <input
                v-model="answers[question.id]"
                type="text"
                maxlength="30"
                placeholder="One word only..."
                class="field-input"
                @input="enforceOneWord(question.id)"
              >
              <p class="text-xs text-purple-300 mt-1">Your answer will appear in the live word cloud.</p>
            </div>

            <!-- Rating -->
            <div v-else-if="question.question_type === 'rating'" class="flex gap-2">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                class="text-3xl transition-transform hover:scale-110 focus:outline-none"
                :class="answers[question.id] && Number(answers[question.id]) >= star ? 'opacity-100' : 'opacity-25'"
                @click="answers[question.id] = String(star)"
              >
                ⭐
              </button>
            </div>

            <!-- Text / Textarea -->
            <div v-else-if="question.question_type === 'text'">
              <textarea
                v-model="answers[question.id]"
                rows="3"
                placeholder="Your answer..."
                class="field-input resize-none"
              />
            </div>

            <!-- Radio — single select -->
            <div v-else-if="question.question_type === 'radio' && !question.allow_multiple" class="flex flex-wrap gap-2">
              <button
                v-for="option in question.options"
                :key="option"
                type="button"
                class="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                :class="answers[question.id] === option
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300'"
                @click="answers[question.id] = option"
              >
                {{ option }}
              </button>
            </div>

            <!-- Radio — multi select -->
            <div v-else-if="question.question_type === 'radio' && question.allow_multiple" class="flex flex-wrap gap-2">
              <p class="w-full text-xs text-purple-400 -mt-1 mb-1">Select all that apply</p>
              <button
                v-for="option in question.options"
                :key="option"
                type="button"
                class="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                :class="isChecked(question.id, option)
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300'"
                @click="toggleCheckbox(question.id, option)"
              >
                {{ option }}
              </button>
            </div>

            <!-- Optional comments box -->
            <div v-if="question.has_comments" class="mt-3">
              <textarea
                v-model="comments[question.id]"
                rows="2"
                placeholder="Any other comments..."
                class="field-input resize-none"
              />
            </div>
          </div>

          <!-- Error -->
          <p v-if="errorMsg" class="text-red-500 text-sm mb-3 px-1">{{ errorMsg }}</p>

          <!-- Submit -->
          <button
            type="submit"
            class="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-xl font-semibold text-base tracking-wide transition-opacity disabled:opacity-50 mt-2"
            :disabled="submitting"
          >
            {{ submitting ? 'Submitting...' : 'Submit Feedback' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { questions, responses, loading, fetchQuestions, fetchResponses, submitResponse, subscribeResponses, getWordCloudData } = useFeedback()

const answers = ref<Record<string, string | string[]>>({})
const comments = ref<Record<string, string>>({})
const submitting = ref(false)
const submitted = ref(false)
const errorMsg = ref('')

const wordCloudData = computed(() => getWordCloudData())
const responseCount = computed(() => responses.value.length)

// Enforce single word — strip spaces
function enforceOneWord(id: string) {
  const v = answers.value[id]
  if (typeof v === 'string') answers.value[id] = v.replace(/\s+/g, '')
}

// Multi-select helpers
function isChecked(id: string, option: string): boolean {
  const v = answers.value[id]
  return Array.isArray(v) && v.includes(option)
}

function toggleCheckbox(id: string, option: string) {
  const current = answers.value[id]
  const arr = Array.isArray(current) ? [...current] : []
  const idx = arr.indexOf(option)
  idx === -1 ? arr.push(option) : arr.splice(idx, 1)
  answers.value[id] = arr
}

function hasAnswer(id: string): boolean {
  const v = answers.value[id]
  return Array.isArray(v) ? v.length > 0 : !!v?.trim()
}

async function submit() {
  errorMsg.value = ''

  const missing = questions.value.filter(q => q.required && !hasAnswer(q.id))
  if (missing.length > 0) {
    errorMsg.value = `Please answer the required question${missing.length > 1 ? 's' : ''}.`
    return
  }

  submitting.value = true

  // Serialise arrays to comma-separated strings before storing
  const serialised: Record<string, string> = {}
  Object.entries(answers.value).forEach(([k, v]) => {
    serialised[k] = Array.isArray(v) ? v.join(', ') : v
  })

  // Merge in comments keyed as `{questionId}_comments`
  Object.entries(comments.value).forEach(([k, v]) => {
    if (v?.trim()) serialised[`${k}_comments`] = v.trim()
  })

  const error = await submitResponse(serialised)
  if (error) {
    errorMsg.value = 'Something went wrong. Please try again.'
  } else {
    submitted.value = true
    await fetchResponses()
  }
  submitting.value = false
}

onMounted(async () => {
  await fetchQuestions()
  await fetchResponses()

  // Pre-init multi-select questions as empty arrays
  questions.value.forEach(q => {
    if (q.question_type === 'radio' && q.allow_multiple) {
      answers.value[q.id] = []
    }
  })

  const channel = subscribeResponses()
  onUnmounted(() => { channel.unsubscribe() })
})
</script>

<style scoped>
.field-input {
  @apply w-full px-3.5 py-2.5 border border-purple-100 rounded-xl text-sm text-purple-800 bg-purple-50
         focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:bg-white
         transition-all font-sans;
}
</style>
