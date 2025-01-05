<!-- src/components/key-management/KeyDisplay.vue -->
<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
      <Key class="w-6 h-6 text-blue-500" />
      Your Key Pairs
    </h2>

    <div
      v-if="keyStore.keyPairs.length === 0"
      class="text-center p-8 text-gray-500 border-2 border-dashed rounded-lg"
    >
      <Lock class="w-12 h-12 mx-auto mb-3 text-gray-400" />
      <p>No key pairs generated yet. Generate one to get started!</p>
    </div>

    <TransitionGroup name="list" tag="div" class="space-y-4">
      <div
        v-for="(keyPair, index) in keyStore.keyPairs"
        :key="keyPair.createdAt"
        class="relative bg-gray-50 rounded-lg p-4 transform transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
      >
        <!-- Header -->
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-medium flex items-center gap-2">
            <Shield class="w-4 h-4 text-blue-500" />
            Key Pair #{{ index + 1 }} ({{ keyPair.keySize }} bits)
          </h3>
          <div class="flex gap-2">
            <button
              @click="copyPublicKey(keyPair.publicKey, index)"
              class="p-2 hover:bg-blue-100 rounded-full transition-colors duration-300 relative group"
              :class="{ 'text-green-500': copiedIndex === index }"
            >
              <span
                class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                {{ copiedIndex === index ? 'Copied!' : 'Copy public key' }}
              </span>
              <Copy class="w-4 h-4" />
            </button>
            <button
              @click="confirmDelete(index)"
              class="p-2 hover:bg-red-100 rounded-full transition-colors duration-300 text-red-500 relative group"
            >
              <span
                class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                Delete key pair
              </span>
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Creation Date -->
        <div class="text-xs text-gray-500 mb-2">
          Created: {{ new Date(keyPair.createdAt).toLocaleString() }}
        </div>

        <!-- Public Key Preview -->
        <div class="mt-2 p-2 bg-white rounded text-xs font-mono overflow-hidden">
          {{ truncateKey(keyPair.publicKey) }}
        </div>
      </div>
    </TransitionGroup>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="duration-300 ease-out"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div class="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 class="text-lg font-bold mb-4">Delete Key Pair</h3>
            <p class="text-gray-600 mb-4">
              Are you sure you want to delete this key pair? This action cannot be undone.
            </p>
            <div class="flex justify-end gap-3">
              <button
                @click="showDeleteModal = false"
                class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                @click="deleteKeyPair"
                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Key, Shield, Copy, Trash2, Lock } from 'lucide-vue-next'
import { useKeyStore } from '@/stores/keyStore'

const keyStore = useKeyStore()
const copiedIndex = ref(null)
const showDeleteModal = ref(false)
const deleteIndex = ref(null)

function truncateKey(key) {
  return key?.slice(0, 64) + '...' || ''
}

async function copyPublicKey(key, index) {
  await navigator.clipboard.writeText(key)
  copiedIndex.value = index
  setTimeout(() => {
    copiedIndex.value = null
  }, 2000)
}

function confirmDelete(index) {
  deleteIndex.value = index
  showDeleteModal.value = true
}

function deleteKeyPair() {
  if (deleteIndex.value !== null) {
    keyStore.deleteKeyPair(deleteIndex.value)
  }
  showDeleteModal.value = false
  deleteIndex.value = null
}
</script>

<style>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
</style>
