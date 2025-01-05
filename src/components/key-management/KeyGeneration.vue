<!-- src/components/key-management/KeyGeneration.vue -->
<template>
  <div
    class="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl"
  >
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <KeyIcon class="w-6 h-6 text-blue-500" :class="{ 'animate-spin': isGenerating }" />
        Generate New Key Pair
      </h2>
    </div>

    <div class="space-y-4">
      <!-- Key Size Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Key Size (bits)</label>
        <select
          v-model="selectedKeySize"
          :disabled="isGenerating"
          class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gradient-to-r from-gray-50 to-white transition-all duration-300 hover:shadow-md cursor-pointer"
        >
          <option v-for="size in keySizes" :key="size" :value="size">{{ size }} bits</option>
        </select>
      </div>

      <!-- Generate Button -->
      <BaseButton @click="generateKeyPair" :loading="isGenerating" variant="primary" block>
        <template #icon>
          <KeyIcon v-if="!isGenerating" class="w-5 h-5" />
        </template>
        {{ isGenerating ? 'Generating...' : 'Generate Key Pair' }}
      </BaseButton>
    </div>

    <!-- Success Animation -->
    <Transition
      enter-active-class="duration-300 ease-out"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="showSuccess"
        class="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2"
      >
        <CheckCircleIcon class="w-5 h-5" />
        Key pair generated successfully!
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { KeyIcon, CheckCircleIcon } from 'lucide-vue-next'
import { rsaService } from '@/services/rsaService'
import { useKeyStore } from '@/stores/keyStore'

const keyStore = useKeyStore()
const selectedKeySize = ref(2048)
const isGenerating = ref(false)
const showSuccess = ref(false)
const keySizes = [1024, 2048, 4096]

async function generateKeyPair() {
  isGenerating.value = true
  showSuccess.value = false

  try {
    // Artificial delay for UX
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const keyPair = rsaService.generateKeyPair(selectedKeySize.value)
    keyStore.addKeyPair(keyPair)

    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  } finally {
    isGenerating.value = false
  }
}
</script>
