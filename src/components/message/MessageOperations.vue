<!-- src/components/message/MessageOperations.vue -->
<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <!-- Title with Animation -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <component
          :is="mode === 'encrypt' ? Lock : Unlock"
          class="w-6 h-6"
          :class="{ 'text-blue-500': mode === 'encrypt', 'text-green-500': mode === 'decrypt' }"
        />
        Message {{ mode === 'encrypt' ? 'Encryption' : 'Decryption' }}
      </h2>
    </div>

    <!-- Mode Toggle -->
    <div class="flex gap-4 mb-6">
      <button
        @click="setMode('encrypt')"
        :class="[
          'flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300',
          mode === 'encrypt'
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
            : 'bg-gray-100 hover:bg-gray-200',
        ]"
      >
        <Lock class="w-4 h-4" />
        Encrypt
      </button>
      <button
        @click="setMode('decrypt')"
        :class="[
          'flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300',
          mode === 'decrypt'
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
            : 'bg-gray-100 hover:bg-gray-200',
        ]"
      >
        <Unlock class="w-4 h-4" />
        Decrypt
      </button>
    </div>

    <!-- Key Selection -->
    <div v-if="keyStore.keyPairs.length > 0" class="mb-4">
      <label class="block text-sm font-medium mb-1 text-gray-700">Select Key Pair</label>
      <select
        v-model="selectedKeyIndex"
        class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gradient-to-r from-gray-50 to-white transition-all duration-300 hover:shadow-md"
      >
        <option v-for="(key, index) in keyStore.keyPairs" :key="index" :value="index">
          Key Pair #{{ index + 1 }} ({{ key.keySize }} bits)
        </option>
      </select>
    </div>
    <div v-else class="mb-4 p-4 bg-yellow-50 text-yellow-700 rounded-lg flex items-center gap-2">
      <AlertTriangle class="w-5 h-5" />
      Please generate a key pair first in the Key Management section
    </div>

    <!-- Message Input -->
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1 text-gray-700">
        {{ mode === 'encrypt' ? 'Message to Encrypt' : 'Message to Decrypt' }}
      </label>
      <div class="relative">
        <textarea
          v-model="message"
          :placeholder="
            mode === 'encrypt' ? 'Enter message to encrypt...' : 'Enter encrypted message...'
          "
          class="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 transition-all duration-300 pr-20 resize-none"
          :class="{ 'border-red-500': error }"
        ></textarea>
        <div
          v-if="mode === 'encrypt' && selectedKey"
          class="absolute right-2 top-2 text-xs text-gray-500"
        >
          {{ message.length }}/{{ maxLength }}
        </div>
      </div>
      <!-- Error Message -->
      <TransitionGroup name="fade">
        <p v-if="error" :key="error" class="mt-2 text-sm text-red-600 flex items-center gap-1">
          <AlertTriangle class="w-4 h-4" />
          {{ error }}
        </p>
      </TransitionGroup>
    </div>

    <!-- Process Button -->
    <button
      @click="processMessage"
      :disabled="!canProcess"
      class="w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2 mb-4"
      :class="[
        mode === 'encrypt'
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      ]"
    >
      <component
        :is="isProcessing ? RefreshCw : mode === 'encrypt' ? Lock : Unlock"
        class="w-4 h-4"
        :class="{ 'animate-spin': isProcessing }"
      />
      {{ buttonText }}
    </button>

    <!-- Result Section -->
    <TransitionGroup name="fade">
      <div v-if="result" :key="result" class="mt-4">
        <div class="flex items-center justify-between mb-1">
          <label class="block text-sm font-medium text-gray-700">
            {{ mode === 'encrypt' ? 'Encrypted Message' : 'Decrypted Message' }}
          </label>
          <button
            @click="copyToClipboard"
            class="p-1 hover:bg-gray-100 rounded-full transition-colors duration-300 relative group"
            :class="{ 'text-green-500': copied }"
          >
            <span
              class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              {{ copied ? 'Copied!' : 'Copy to clipboard' }}
            </span>
            <Copy class="w-4 h-4" />
          </button>
        </div>
        <div class="relative">
          <textarea
            v-model="result"
            readonly
            class="w-full p-3 border rounded-lg h-32 bg-gray-50 resize-none"
          ></textarea>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Lock, Unlock, AlertTriangle, Copy, RefreshCw } from 'lucide-vue-next'
import { useKeyStore } from '@/stores/keyStore'
import { rsaService } from '@/services/rsaService'
// import { useOperationsStore } from '@/stores/operationsStore'

// const operationsStore = useOperationsStore()
const keyStore = useKeyStore()
const mode = ref('encrypt')
const selectedKeyIndex = ref(0)
const message = ref('')
const result = ref('')
const error = ref('')
const isProcessing = ref(false)
const copied = ref(false)

const selectedKey = computed(() => keyStore.keyPairs[selectedKeyIndex.value])
const maxLength = computed(() =>
  selectedKey.value ? rsaService.getMaxMessageLength(selectedKey.value.keySize) : 0,
)

const canProcess = computed(() => message.value && selectedKey.value && !isProcessing.value)

const buttonText = computed(() => {
  if (isProcessing.value) return 'Processing...'
  return mode.value === 'encrypt' ? 'Encrypt Message' : 'Decrypt Message'
})

function setMode(newMode) {
  mode.value = newMode
  message.value = ''
  result.value = ''
  error.value = ''
}

async function processMessage() {
  if (!canProcess.value) return

  error.value = ''
  isProcessing.value = true
  result.value = ''

  try {
    // Add artificial delay for UX
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (mode.value === 'encrypt') {
      // Just encrypt the message without the validation
      const encrypted = rsaService.encryptMessage(selectedKey.value.publicKey, message.value)

      if (!encrypted) {
        throw new Error('Encryption failed. Please try again.')
      }

      result.value = encrypted
    } else {
      const decrypted = rsaService.decryptMessage(selectedKey.value.privateKey, message.value)

      if (!decrypted) {
        throw new Error('Decryption failed. Please make sure the message is properly encrypted.')
      }

      result.value = decrypted
    }
  } catch (err) {
    error.value = err.message
  } finally {
    isProcessing.value = false
  }
}

async function copyToClipboard() {
  await navigator.clipboard.writeText(result.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-move {
  transition: transform 0.3s ease;
}
</style>
