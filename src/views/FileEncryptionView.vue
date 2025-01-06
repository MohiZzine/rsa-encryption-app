<!-- src/views/FileEncryptionView.vue -->
<template>
  <div class="space-y-8">
    <BaseCard>
      <template #header>
        <div class="flex items-center gap-3">
          <FileKey class="w-6 h-6 text-indigo-500" />
          <h2 class="text-xl font-bold">Secure File Encryption</h2>
        </div>
      </template>

      <!-- File Upload Area -->
      <div class="mb-8">
        <div
          class="border-2 border-dashed rounded-lg p-8 text-center"
          :class="[
            isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300',
            'transition-colors duration-300'
          ]"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleFileDrop"
        >
          <input
            type="file"
            ref="fileInput"
            class="hidden"
            @change="handleFileSelect"
          />
          
          <div v-if="!selectedFile" class="space-y-4">
            <FileUp class="w-12 h-12 mx-auto text-gray-400" />
            <div>
              <p class="text-gray-600">
                Drag and drop your file here, or
                <button 
                  @click="$refs.fileInput.click()"
                  class="text-indigo-500 hover:text-indigo-600"
                >
                  browse
                </button>
              </p>
              <p class="text-sm text-gray-500 mt-2">
                Your file will be encrypted with the selected recipient's public key
              </p>
            </div>
          </div>

          <div v-else class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <File class="w-6 h-6 text-indigo-500" />
              <div class="text-left">
                <p class="font-medium">{{ selectedFile.name }}</p>
                <p class="text-sm text-gray-500">
                  {{ formatFileSize(selectedFile.size) }}
                </p>
              </div>
            </div>
            <button
              @click="selectedFile = null"
              class="text-gray-400 hover:text-gray-500"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Encryption Controls -->
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Key Selection -->
        <div>
          <label class="block text-sm font-medium mb-2">Recipient's Key Pair</label>
          <select
            v-model="selectedKeyIndex"
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500
                   transition-all duration-300"
            :class="{ 'border-red-500': error && !selectedKeyIndex }"
          >
            <option value="">Select a key pair...</option>
            <option
              v-for="(key, index) in keyStore.keyPairs"
              :key="index"
              :value="index"
            >
              Key Pair #{{ index + 1 }} ({{ key.keySize }} bits)
            </option>
          </select>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <BaseButton
            @click="encryptFile"
            :loading="isProcessing"
            :disabled="!canEncrypt"
            variant="primary"
            block
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
            block
          >
            <template #icon>
              <Unlock class="w-4 h-4" />
            </template>
            Decrypt File
          </BaseButton>
        </div>
      </div>

      <!-- Error Display -->
      <BaseAlert
        v-if="error"
        variant="error"
        :title="error"
        class="mt-4"
        dismissible
        @dismiss="error = ''"
      />

      <!-- Processing Information -->
      <div 
        v-if="isProcessing"
        class="mt-4 p-4 bg-blue-50 rounded-lg animate-pulse"
      >
        <div class="flex items-center gap-3">
          <RefreshCw class="w-5 h-5 text-blue-500 animate-spin" />
          <p class="text-blue-700">{{ processingMessage }}</p>
        </div>
        <div class="mt-2">
          <div class="w-full bg-blue-200 rounded-full h-2">
            <div
              class="bg-blue-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Information Section -->
      <div class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 class="font-medium mb-2 flex items-center gap-2">
          <Info class="w-5 h-5 text-gray-600" />
          How it works
        </h3>
        <ol class="text-sm text-gray-600 space-y-1 ml-6 list-decimal">
          <li>Select or drag & drop your file</li>
          <li>Choose the recipient's key pair</li>
          <li>File is split into chunks and encrypted with RSA</li>
          <li>Each chunk is encrypted with the recipient's public key</li>
          <li>Encrypted file can only be decrypted with the corresponding private key</li>
        </ol>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  FileKey, FileUp, File, X, Lock, Unlock,
  RefreshCw, Info 
} from 'lucide-vue-next'
import { useKeyStore } from '@/stores/keyStore'
import { rsaService } from '@/services/rsaService'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'

const keyStore = useKeyStore()
const selectedFile = ref(null)
const selectedKeyIndex = ref('')
const isDragging = ref(false)
const isProcessing = ref(false)
const error = ref('')
const progress = ref(0)
const processingMessage = ref('')

const canEncrypt = computed(() => 
  selectedFile.value && selectedKeyIndex.value !== ''
)

const canDecrypt = computed(() => 
  selectedFile.value && selectedKeyIndex.value !== ''
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
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target.result
        processingMessage.value = 'Encrypting file...'

        // Split content into chunks
        const chunkSize = rsaService.getMaxMessageLength(
          keyStore.keyPairs[selectedKeyIndex.value].keySize
        )
        const chunks = []
        for (let i = 0; i < content.length; i += chunkSize) {
          const chunk = content.slice(i, i + chunkSize)
          const encrypted = rsaService.encryptMessage(
            keyStore.keyPairs[selectedKeyIndex.value].publicKey,
            chunk
          )
          chunks.push(encrypted)
          progress.value = Math.round((i / content.length) * 100)
        }

        // Create encrypted file content
        const encryptedContent = JSON.stringify({
          chunks,
          originalName: selectedFile.value.name,
          timestamp: new Date().toISOString()
        })

        // Create and download file
        const blob = new Blob([encryptedContent], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedFile.value.name}.encrypted`
        a.click()
        window.URL.revokeObjectURL(url)

        selectedFile.value = null
        progress.value = 100
      } catch (err) {
        error.value = 'Failed to encrypt file: ' + err.message
      } finally {
        isProcessing.value = false
      }
    }

    reader.readAsText(selectedFile.value)
  } catch (err) {
    error.value = 'Failed to read file: ' + err.message
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
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = JSON.parse(e.target.result)
        processingMessage.value = 'Decrypting file...'

        // Decrypt all chunks
        const decryptedChunks = []
        for (let i = 0; i < content.chunks.length; i++) {
          const decrypted = rsaService.decryptMessage(
            keyStore.keyPairs[selectedKeyIndex.value].privateKey,
            content.chunks[i]
          )
          decryptedChunks.push(decrypted)
          progress.value = Math.round((i / content.chunks.length) * 100)
        }

        // Combine chunks and download
        const decryptedContent = decryptedChunks.join('')
        const blob = new Blob([decryptedContent], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = content.originalName
        a.click()
        window.URL.revokeObjectURL(url)

        selectedFile.value = null
        progress.value = 100
      } catch (err) {
        error.value = 'Failed to decrypt file: ' + err.message
      } finally {
        isProcessing.value = false
      }
    }

    reader.readAsText(selectedFile.value)
  } catch (err) {
    error.value = 'Failed to read encrypted file: ' + err.message
    isProcessing.value = false
  }
}
</script>