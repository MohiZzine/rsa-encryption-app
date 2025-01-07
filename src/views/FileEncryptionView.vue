<!-- src/views/FileEncryptionView.vue -->
<template>
  <BaseCard>
    <template #header>
      <div class="flex items-center gap-3">
        <FileKey class="w-6 h-6 text-blue-500" />
        <h2 class="text-xl font-bold">File Encryption</h2>
      </div>
    </template>

    <!-- Key Selection -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">Select Key Pair</label>
      <select
        v-model="selectedKeyIndex"
        class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Choose a key pair...</option>
        <option v-for="(key, index) in keyStore.keyPairs" :key="index" :value="index">
          Key Pair #{{ index + 1 }} ({{ key.keySize }} bits)
        </option>
      </select>
    </div>

    <!-- File Drop Zone -->
    <div
      class="border-2 border-dashed rounded-lg p-8 text-center mb-6"
      :class="[
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
        'transition-colors duration-300',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleFileDrop"
    >
      <input type="file" ref="fileInput" class="hidden" @change="handleFileSelect" />

      <!-- src/views/FileEncryptionView.vue (continued) -->
      <div v-if="!selectedFile" class="space-y-4">
        <FileUp class="w-12 h-12 mx-auto text-gray-400" />
        <div>
          <p class="text-gray-600">
            Drag and drop your file here, or
            <button @click="$refs.fileInput.click()" class="text-blue-500 hover:text-blue-600">
              browse
            </button>
          </p>
          <p class="text-sm text-gray-500 mt-2">Your file will be encrypted with RSA encryption</p>
        </div>
      </div>

      <div v-else class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <File class="w-6 h-6 text-blue-500" />
          <div class="text-left">
            <p class="font-medium">{{ selectedFile.name }}</p>
            <p class="text-sm text-gray-500">
              {{ formatFileSize(selectedFile.size) }}
            </p>
          </div>
        </div>
        <button @click="selectedFile = null" class="text-gray-400 hover:text-gray-500">
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="grid grid-cols-2 gap-4">
      <BaseButton
        @click="encryptFile"
        :loading="isProcessing"
        :disabled="!canEncrypt"
        variant="primary"
      >
        <template #icon>
          <Lock class="w-4 h-4" />
        </template>
        Encrypt & Download
      </BaseButton>

      <BaseButton
        @click="decryptFile"
        :loading="isProcessing"
        :disabled="!canDecrypt"
        variant="secondary"
      >
        <template #icon>
          <Unlock class="w-4 h-4" />
        </template>
        Decrypt & Download
      </BaseButton>
    </div>

    <!-- Progress -->
    <Transition name="fade">
      <div v-if="isProcessing" class="mt-6">
        <div class="flex items-center gap-3 mb-2">
          <Loader2 class="w-5 h-5 animate-spin text-blue-500" />
          <span class="text-blue-700">{{ processingMessage }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>
    </Transition>

    <!-- Error Display -->
    <BaseAlert
      v-if="error"
      variant="error"
      :title="error"
      class="mt-4"
      dismissible
      @dismiss="error = ''"
    />
  </BaseCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FileKey, FileUp, File, Lock, Unlock, X, Loader2 } from 'lucide-vue-next'
import { useKeyStore } from '@/stores/keyStore'
import { fileService } from '@/services/fileService'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'

const keyStore = useKeyStore()
const selectedKeyIndex = ref('')
const selectedFile = ref(null)
const isDragging = ref(false)
const isProcessing = ref(false)
const processingMessage = ref('')
const progress = ref(0)
const error = ref('')

const canEncrypt = computed(
  () => selectedFile.value && selectedKeyIndex.value !== '' && !isProcessing.value,
)

const canDecrypt = computed(
  () =>
    selectedFile.value &&
    selectedKeyIndex.value !== '' &&
    !isProcessing.value &&
    selectedFile.value.name.endsWith('.encrypted'),
)

function handleFileDrop(e) {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    selectedFile.value = files[0]
  }
}

function handleFileSelect(e) {
  const files = e.target.files
  if (files.length > 0) {
    selectedFile.value = files[0]
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function encryptFile() {
  if (!canEncrypt.value) return

  isProcessing.value = true
  error.value = ''
  progress.value = 0
  processingMessage.value = 'Reading file...'

  try {
    progress.value = 20
    processingMessage.value = 'Encrypting file...'

    const encrypted = await fileService.encryptFile(
      selectedFile.value,
      keyStore.keyPairs[selectedKeyIndex.value].publicKey,
    )

    progress.value = 80
    processingMessage.value = 'Preparing download...'

    // Create and download encrypted file
    const blob = new Blob([encrypted], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedFile.value.name}.encrypted`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    progress.value = 100
    processingMessage.value = 'File encrypted successfully!'

    // Reset after a moment
    setTimeout(() => {
      isProcessing.value = false
      selectedFile.value = null
    }, 2000)
  } catch (err) {
    error.value = 'Failed to encrypt file: ' + err.message
    isProcessing.value = false
  }
}

async function decryptFile() {
  if (!canDecrypt.value) return

  isProcessing.value = true
  error.value = ''
  progress.value = 0
  processingMessage.value = 'Reading encrypted file...'

  try {
    const content = await fileService.readFileAsText(selectedFile.value)

    progress.value = 20
    processingMessage.value = 'Decrypting file...'

    const decryptedFile = await fileService.decryptFile(
      content,
      keyStore.keyPairs[selectedKeyIndex.value].privateKey,
    )

    progress.value = 80
    processingMessage.value = 'Preparing download...'

    fileService.downloadFile(decryptedFile)

    progress.value = 100
    processingMessage.value = 'File decrypted successfully!'

    // Reset after a moment
    setTimeout(() => {
      isProcessing.value = false
      selectedFile.value = null
    }, 2000)
  } catch (err) {
    error.value = 'Failed to decrypt file: ' + err.message
    isProcessing.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
