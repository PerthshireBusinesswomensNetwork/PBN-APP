<template>
  <div>
    <!-- Header -->
    <header class="bg-gradient-to-br from-purple-700 via-purple-500 to-purple-400 text-white px-6 py-7 text-center relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
      <div class="absolute -bottom-14 -left-8 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
      <div class="flex justify-center mb-4 relative">
        <NuxtImg
          src="/PBNLogo.png"
          alt="Perthshire Businesswomen's Network Logo"
          width="300"
          height="200"
          format="webp"
          loading="lazy"
        />
      </div>
      <p class="text-xs font-semibold tracking-widest text-purple-200 uppercase mb-2 relative">
        Perthshire Businesswomen's Network
      </p>
      <h1 class="font-display text-3xl font-bold leading-tight relative">AGM 2025</h1>
      <p class="text-sm text-white/70 font-light mt-1 relative">Who's in the room today?</p>
    </header>

    <!-- Tabs -->
    <nav class="flex bg-white border-b-2 border-purple-100 sticky top-0 z-50 shadow-sm">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="flex-1 py-3.5 text-xs font-semibold tracking-wide transition-colors border-b-[3px] -mb-[2px]"
        :class="activeTab === tab.id
          ? 'text-purple-500 border-purple-500'
          : 'text-purple-300 border-transparent hover:text-purple-400'"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <!-- Tab Content -->
    <main class="max-w-xl mx-auto px-4 py-6 pb-16">
      <RegisterTab v-if="activeTab === 'register'" @registered="onRegistered" />
      <DirectoryTab v-else-if="activeTab === 'directory'" />
      <FeedbackTab v-else-if="activeTab === 'feedback'" />
      <AdminTab v-else-if="activeTab === 'admin'" />
    </main>
  </div>
</template>

<script setup lang="ts">
const tabs = [
  { id: 'register', label: 'Register' },
  { id: 'directory', label: 'Directory' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'admin', label: 'Admin' },
]

const activeTab = ref<'register' | 'directory' | 'feedback' | 'admin'>('register')

function onRegistered() {
  setTimeout(() => { activeTab.value = 'directory' }, 1800)
}
</script>
