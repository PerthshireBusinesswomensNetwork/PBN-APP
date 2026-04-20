<template>
  <div>
    <!-- Already registered notice -->
    <div
      v-if="registered"
      class="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center text-purple-700 text-sm font-medium mb-5"
    >
      ✅ You're registered! Switching you to the directory...
    </div>

    <div class="bg-zinc-50 rounded-2xl p-6 shadow-sm shadow-purple-100 border border-purple-50">
      <h2 class="font-display text-2xl text-purple-700 mb-1">
        Welcome!
      </h2>
      <p class="text-sm text-purple-400 mb-6">
        Add yourself so others can find you.
      </p>

      <form @submit.prevent="register">
        <!-- Name -->
        <div class="mb-4">
          <label class="field-label">Your Name <span class="text-red-400">*</span></label>
          <input
            v-model="form.name"
            type="text"
            maxlength="60"
            placeholder="e.g. Sarah McPherson"
            class="field-input"
            required
          >
        </div>

        <!-- Business -->
        <div class="mb-4">
          <label class="field-label">Business Name <span class="text-red-400">*</span></label>
          <input
            v-model="form.business"
            type="text"
            maxlength="80"
            placeholder="e.g. McPherson Consulting"
            class="field-input"
            required
          >
        </div>

        <!-- Sector -->
        <div class="mb-4">
          <label class="field-label">Sector <span class="text-red-400">*</span></label>
          <select v-model="form.sector" class="field-input" required>
            <option value="">Select your sector...</option>
            <option v-for="s in sectors" :key="s">{{ s }}</option>
          </select>
        </div>

        <!-- Website -->
        <div class="mb-4">
          <label class="field-label">
            Website
            <span class="text-purple-300 font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <input
            v-model="form.website"
            type="url"
            placeholder="https://yourwebsite.com"
            class="field-input"
          >
        </div>

        <!-- LinkedIn -->
        <div class="mb-4">
          <label class="field-label">
            LinkedIn
            <span class="text-purple-300 font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <input
            v-model="form.linkedin"
            type="url"
            placeholder="https://linkedin.com/in/yourname"
            class="field-input"
          >
        </div>

        <!-- Instagram / Facebook -->
        <div class="mb-6">
          <label class="field-label">
            Instagram or Facebook
            <span class="text-purple-300 font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <input
            v-model="form.social"
            type="url"
            placeholder="https://instagram.com/yourhandle"
            class="field-input"
          >
        </div>

        <!-- Photo -->
        <div class="mb-6">
          <label class="field-label">
            Photo
            <span class="text-purple-300 font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <div class="flex items-center gap-4">
            <!-- Avatar preview -->
            <div class="w-16 h-16 rounded-full bg-purple-50 border-2 border-dashed border-purple-300 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img v-if="photoPreview" :src="photoPreview" alt="Preview" class="w-full h-full object-cover">
              <span v-else class="text-2xl">📷</span>
            </div>
            <div>
              <button
                type="button"
                class="px-4 py-2 border border-purple-500 rounded-lg text-purple-600 text-sm font-semibold hover:bg-purple-50 transition-colors"
                @click="triggerPhotoInput"
              >
                Choose photo
              </button>
              <input
                ref="photoInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handlePhoto"
              >
              <p class="text-xs text-purple-300 mt-1">JPG or PNG. Cropped to circle.</p>
            </div>
          </div>
        </div>

        <!-- Error -->
        <p v-if="errorMsg" class="text-red-500 text-sm mb-3">{{ errorMsg }}</p>

        <!-- Submit -->
        <button
          type="submit"
          class="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-xl font-semibold text-base tracking-wide transition-opacity disabled:opacity-50"
          :disabled="submitting || registered"
        >
          {{ submitting ? 'Joining...' : 'Join the Room ✨' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ (e: 'registered'): void }>()

const supabase = useSupabaseClient()

const sectors = [
  'Accounting & Finance',
  'Business Consulting',
  'Construction & Property',
  'Creative & Design',
  'Education & Training',
  'Food & Hospitality',
  'Health & Wellbeing',
  'HR & Recruitment',
  'Legal Services',
  'Marketing & PR',
  'Retail & E-commerce',
  'Technology & Digital',
  'Tourism & Leisure',
  'Other',
]

const form = reactive({
  name: '',
  business: '',
  sector: '',
  website: '',
  linkedin: '',
  social: '',
})

const photoInput = ref<HTMLInputElement | null>(null)
const photoPreview = ref<string | null>(null)
const photoFile = ref<File | null>(null)
const submitting = ref(false)
const registered = ref(false)
const errorMsg = ref('')

function triggerPhotoInput() {
  photoInput.value?.click()
}

function handlePhoto(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  photoFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => {
    photoPreview.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

async function uploadPhoto(attendeeId: string): Promise<string | null> {
  if (!photoFile.value) return null

  const ext = photoFile.value.name.split('.').pop()
  const path = `${attendeeId}.${ext}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, photoFile.value, { upsert: true })

  if (error) {
    console.error('Photo upload failed:', error.message)
    return null
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

async function register() {
  errorMsg.value = ''

  if (!form.name || !form.business || !form.sector) {
    errorMsg.value = 'Please fill in your name, business name and sector.'
    return
  }

  submitting.value = true

  try {
    // Insert attendee first to get the ID
    const { data, error: insertError } = await supabase
      .from('attendees')
      .insert({
        name: form.name.trim(),
        business: form.business.trim(),
        sector: form.sector,
        website: form.website.trim() || null,
        linkedin: form.linkedin.trim() || null,
        social: form.social.trim() || null,
        photo_url: null,
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Upload photo if provided
    let photoUrl: string | null = null
    if (photoFile.value && data) {
      photoUrl = await uploadPhoto(data.id)

      if (photoUrl) {
        await supabase
          .from('attendees')
          .update({ photo_url: photoUrl })
          .eq('id', data.id)
      }
    }

    registered.value = true
    emit('registered')
  } catch (err: any) {
    errorMsg.value = err.message ?? 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.field-label {
  @apply block text-xs font-semibold text-purple-500 tracking-widest uppercase mb-1.5;
}
.field-input {
  @apply w-full px-3.5 py-2.5 border border-purple-100 rounded-xl text-sm text-purple-800 bg-purple-50
         focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:bg-white
         transition-all font-sans;
}
</style>
