<!-- src/components/message/MessageSignature.vue -->
<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <!-- Title with Animation -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Fingerprint class="w-6 h-6 text-indigo-500" :class="{ 'animate-spin': isProcessing }" />
        Digital Signature
      </h2>
    </div>

    <!-- Mode Toggle -->
    <div class="flex gap-4 mb-6">
      <button
        @click="setMode('sign')"
        :class="[
          'flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300',
          mode === 'sign'
            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg scale-105'
            : 'bg-gray-100 hover:bg-gray-200',
        ]"
      >
        <PenTool class="w-4 h-4" />
        Sign Message
      </button>
      <button
        @click="setMode('verify')"
        :class="[
          'flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300',
          mode === 'verify'
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg scale-105'
            : 'bg-gray-100 hover:bg-gray-200',
        ]"
      >
        <CheckCircle2 class="w-4 h-4" />
        Verify Signature
      </button>
    </div>

    <!-- Key Selection -->
    <div v-if="keyStore.keyPairs.length > 0" class="mb-4">
      <label class="block text-sm font-medium mb-1 text-gray-700">Select Key Pair</label>
      <select
        v-model="selectedKeyIndex"
        class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gradient-to-r from-gray-50 to-white transition-all duration-300 hover:shadow-md"
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
      <label class="block text-sm font-medium mb-1 text-gray-700">Message</label>
      <textarea
        v-model="message"
        :placeholder="mode === 'sign' ? 'Enter message to sign...' : 'Enter message to verify...'"
        class="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-indigo-500 transition-all duration-300 resize-none"
        :class="{ 'border-red-500': error }"
      ></textarea>
    </div>

    <!-- Signature Input (for verify mode) -->
    <div v-if="mode === 'verify'" class="mb-4">
      <label class="block text-sm font-medium mb-1 text-gray-700">Signature</label>
      <textarea
        v-model="signatureInput"
        placeholder="Paste the signature here..."
        class="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-indigo-500 transition-all duration-300 resize-none font-mono text-sm"
        :class="{ 'border-red-500': error }"
      ></textarea>
    </div>

    <!-- Error Message -->
    <TransitionGroup name="fade">
      <p v-if="error" :key="error" class="mb-4 text-sm text-red-600 flex items-center gap-1">
        <AlertTriangle class="w-4 h-4" />
        {{ error }}
      </p>
    </TransitionGroup>

    <!-- Process Button -->
    <button
      @click="processSignature"
      :disabled="!canProcess"
      class="w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2 mb-4"
      :class="[
        mode === 'sign'
          ? 'bg-gradient-to-r from-indigo-500 to-indigo-600'
          : 'bg-gradient-to-r from-purple-500 to-purple-600',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      ]"
    >
      <component
        :is="isProcessing ? RefreshCw : mode === 'sign' ? PenTool : CheckCircle2"
        class="w-4 h-4"
        :class="{ 'animate-spin': isProcessing }"
      />
      {{ buttonText }}
    </button>

    <!-- Result Section -->
    <TransitionGroup name="fade">
      <!-- Signature Result -->
      <div v-if="mode === 'sign' && signatureResult" :key="'sign-result'" class="mt-4">
        <div class="mb-4">
          <div class="flex items-center justify-between mb-1">
            <label class="block text-sm font-medium text-gray-700">Message Hash (SHA-256)</label>
            <button
              @click="copyHash"
              class="p-1 hover:bg-gray-100 rounded-full transition-colors duration-300 relative group"
              :class="{ 'text-green-500': copiedHash }"
            >
              <span
                class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                {{ copiedHash ? 'Copied!' : 'Copy hash' }}
              </span>
              <Copy class="w-4 h-4" />
            </button>
          </div>
          <div class="p-2 bg-gray-50 rounded font-mono text-sm break-all">
            {{ signatureResult.hash }}
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-sm font-medium text-gray-700">Digital Signature</label>
            <button
              @click="copySignature"
              class="p-1 hover:bg-gray-100 rounded-full transition-colors duration-300 relative group"
              :class="{ 'text-green-500': copiedSignature }"
            >
              <span
                class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                {{ copiedSignature ? 'Copied!' : 'Copy signature' }}
              </span>
              <Copy class="w-4 h-4" />
            </button>
          </div>
          <div class="p-2 bg-gray-50 rounded font-mono text-sm break-all">
            {{ signatureResult.signature }}
          </div>
        </div>
      </div>

      <!-- Verification Result -->
      <div
        v-if="mode === 'verify' && verificationResult !== null"
        :key="'verify-result'"
        class="mt-4 p-4 rounded-lg flex items-center gap-3"
        :class="verificationResult ? 'bg-green-50' : 'bg-red-50'"
      >
        <component
          :is="verificationResult ? CheckCircle2 : XCircle"
          class="w-6 h-6"
          :class="verificationResult ? 'text-green-500' : 'text-red-500'"
        />
        <div>
          <h3 class="font-medium" :class="verificationResult ? 'text-green-700' : 'text-red-700'">
            {{ verificationResult ? 'Valid Signature' : 'Invalid Signature' }}
          </h3>
          <p class="text-sm" :class="verificationResult ? 'text-green-600' : 'text-red-600'">
            {{
              verificationResult
                ? 'The signature is valid and the message has not been tampered with.'
                : 'The signature is invalid or the message has been modified.'
            }}
          </p>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Fingerprint,
  PenTool,
  CheckCircle2,
  AlertTriangle,
  Copy,
  RefreshCw,
  XCircle,
} from 'lucide-vue-next'
import { useKeyStore } from '@/stores/keyStore'
import { rsaService } from '@/services/rsaService'
import { useOperationsStore } from '@/stores/operationsStore'

const operationsStore = useOperationsStore()
const keyStore = useKeyStore()
const mode = ref('sign')
const selectedKeyIndex = ref(0)
const message = ref('')
const signatureInput = ref('')
const error = ref('')
const isProcessing = ref(false)
const signatureResult = ref(null)
const verificationResult = ref(null)
const copiedHash = ref(false)
const copiedSignature = ref(false)

const selectedKey = computed(() => keyStore.keyPairs[selectedKeyIndex.value])

const canProcess = computed(() => {
  if (!message.value || !selectedKey.value || isProcessing.value) return false
  if (mode.value === 'verify' && !signatureInput.value) return false
  return true
})

const buttonText = computed(() => {
  if (isProcessing.value) return 'Processing...'
  return mode.value === 'sign' ? 'Sign Message' : 'Verify Signature'
})

function setMode(newMode) {
  mode.value = newMode
  message.value = ''
  signatureInput.value = ''
  error.value = ''
  signatureResult.value = null
  verificationResult.value = null
}

async function processSignature() {
  if (!canProcess.value) return

  error.value = ''
  isProcessing.value = true
  signatureResult.value = null
  verificationResult.value = null

  try {
    // Add artificial delay for UX
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (mode.value === 'sign') {
      signatureResult.value = rsaService.signMessage(selectedKey.value.privateKey, message.value)
      operationsStore.addOperation({
        type: 'sign',
        success: true
      })
    } else {
      verificationResult.value = rsaService.verifySignature(
        selectedKey.value.publicKey,
        message.value,
        signatureInput.value,
      )
      operationsStore.addOperation({
        type: 'sign',
        success: true
      })
    }

  } catch (err) {
    error.value = err.message
  } finally {
    isProcessing.value = false
  }
}

async function copyHash() {
  if (!signatureResult.value?.hash) return
  await navigator.clipboard.writeText(signatureResult.value.hash)
  copiedHash.value = true
  setTimeout(() => {
    copiedHash.value = false
  }, 2000)
}

async function copySignature() {
  if (!signatureResult.value?.signature) return
  await navigator.clipboard.writeText(signatureResult.value.signature)
  copiedSignature.value = true
  setTimeout(() => {
    copiedSignature.value = false
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

/* Hash visualization animation */
.hash-char {
  @apply inline-block transition-all duration-300;
}

.hash-char-highlight {
  @apply text-indigo-500 transform scale-110;
}
</style>
