<!-- src/views/KeyVisualizationView.vue -->
<template>
  <div class="space-y-8">
    <!-- Key Generation Process Visualization -->
    <BaseCard>
      <template #header>
        <div class="flex items-center gap-3">
          <Fingerprint class="w-6 h-6 text-blue-500" />
          <h2 class="text-xl font-bold">RSA Key Generation Process</h2>
        </div>
      </template>

      <div class="relative">
        <!-- Key Size Selection -->
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Select Key Size</h3>
          <div class="grid grid-cols-3 gap-4">
            <button
              v-for="size in [1024, 2048, 4096]"
              :key="size"
              @click="selectedKeySize = size"
              class="p-4 border rounded-lg text-center transition-all duration-300"
              :class="[
                selectedKeySize === size
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'hover:border-gray-400',
              ]"
            >
              <div class="text-xl font-bold mb-1">{{ size }}</div>
              <div class="text-sm text-gray-600">bits</div>
            </button>
          </div>
        </div>

        <!-- Generation Process -->
        <div class="space-y-6">
          <BaseButton
            @click="startGeneration"
            :loading="isGenerating"
            variant="primary"
            :disabled="isGenerating"
            block
          >
            <template #icon>
              <Key class="w-4 h-4" />
            </template>
            {{ isGenerating ? 'Generating...' : 'Generate New Key Pair' }}
          </BaseButton>

          <!-- Generation Steps Visualization -->
          <TransitionGroup name="list" tag="div" class="space-y-4">
            <div
              v-for="(step, index) in generationSteps"
              :key="index"
              class="p-4 rounded-lg transition-all duration-300"
              :class="[
                step.active
                  ? step.success
                    ? 'bg-green-50 text-green-700'
                    : 'bg-blue-50 text-blue-700'
                  : 'bg-gray-50 text-gray-600',
              ]"
            >
              <div class="flex items-center gap-3">
                <component
                  :is="step.icon"
                  class="w-5 h-5"
                  :class="[
                    step.active
                      ? step.success
                        ? 'text-green-500'
                        : 'text-blue-500'
                      : 'text-gray-400',
                  ]"
                />
                <div>
                  <div class="font-medium">{{ step.title }}</div>
                  <div class="text-sm opacity-75">{{ step.description }}</div>
                </div>
                <div v-if="step.active" class="ml-auto">
                  <Loader2 v-if="!step.success" class="w-4 h-4 animate-spin" />
                  <CheckCircle v-else class="w-4 h-4 text-green-500" />
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Generated Keys Display -->
        <Transition name="fade">
          <div v-if="generatedKeys" class="mt-6 space-y-4">
            <h3 class="text-lg font-medium">Generated Key Pair</h3>

            <!-- Public Key -->
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <div class="font-medium text-gray-700 flex items-center gap-2">
                  <LockOpen class="w-4 h-4 text-green-500" />
                  Public Key
                </div>
                <button
                  @click="copyPublicKey"
                  class="text-blue-500 hover:text-blue-600"
                  title="Copy public key"
                >
                  <Copy class="w-4 h-4" />
                </button>
              </div>
              <div class="font-mono text-sm text-gray-600 break-all">
                {{ truncateKey(generatedKeys.publicKey) }}
              </div>
            </div>

            <!-- Private Key -->
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <div class="font-medium text-gray-700 flex items-center gap-2">
                  <Lock class="w-4 h-4 text-red-500" />
                  Private Key
                </div>
                <button
                  @click="copyPrivateKey"
                  class="text-blue-500 hover:text-blue-600"
                  title="Copy private key"
                >
                  <Copy class="w-4 h-4" />
                </button>
              </div>
              <div class="font-mono text-sm text-gray-600 break-all">
                {{ truncateKey(generatedKeys.privateKey) }}
              </div>
            </div>

            <!-- Security Info -->
            <div class="p-4 border border-blue-100 bg-blue-50 rounded-lg">
              <h4 class="font-medium text-blue-700 flex items-center gap-2 mb-2">
                <ShieldCheck class="w-4 h-4" />
                Security Information
              </h4>
              <ul class="space-y-2 text-sm text-blue-600">
                <li class="flex items-center gap-2">
                  <Circle class="w-2 h-2 fill-current" />
                  {{ selectedKeySize }} bit key length provides {{ getSecurityLevel() }}
                </li>
                <li class="flex items-center gap-2">
                  <Circle class="w-2 h-2 fill-current" />
                  Maximum message length: {{ getMaxMessageLength() }} bytes
                </li>
                <li class="flex items-center gap-2">
                  <Circle class="w-2 h-2 fill-current" />
                  Estimated time to break: {{ getTimeToBreak() }}
                </li>
              </ul>
            </div>
          </div>
        </Transition>
      </div>
    </BaseCard>

    <!-- Interactive Demonstration -->
    <BaseCard>
      <template #header>
        <div class="flex items-center gap-3">
          <BookOpen class="w-6 h-6 text-blue-500" />
          <h2 class="text-xl font-bold">How RSA Keys Work</h2>
        </div>
      </template>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Encryption Flow -->
        <div>
          <h3 class="text-lg font-medium mb-4">Message Encryption</h3>
          <div class="relative">
            <textarea
              v-model="demoMessage"
              placeholder="Type a message to see encryption in action..."
              class="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              :disabled="!generatedKeys"
            ></textarea>

            <Transition name="fade">
              <div
                v-if="demoEncrypted"
                class="mt-4 p-3 bg-gray-50 rounded-lg font-mono text-sm break-all"
              >
                {{ demoEncrypted }}
              </div>
            </Transition>
          </div>
        </div>

        <!-- Visualization -->
        <div class="relative">
          <div class="h-full flex items-center justify-center">
            <div class="text-center space-y-4">
              <div v-if="!generatedKeys" class="text-gray-500">
                Generate a key pair to see the encryption process
              </div>
              <div v-else-if="!demoMessage" class="text-gray-500">
                Type a message to start the visualization
              </div>
              <div v-else class="space-y-6">
                <!-- Message Flow Animation -->
                <div class="flex items-center gap-4 justify-center">
                  <div class="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText class="w-8 h-8 text-blue-500" />
                  </div>
                  <div class="flex-1 relative">
                    <div
                      class="h-1 bg-blue-200 relative overflow-hidden"
                      :class="{ 'animate-pulse': isEncrypting }"
                    >
                      <div
                        class="absolute inset-0 bg-blue-500 transition-transform duration-1000"
                        :class="{ 'translate-x-full': !isEncrypting }"
                      ></div>
                    </div>
                  </div>
                  <div class="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                    <Lock class="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <!-- Status Text -->
                <div class="text-sm text-gray-600">
                  {{ encryptionStatus }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  Fingerprint,
  Key,
  Lock,
  LockOpen,
  Copy,
  CheckCircle,
  ShieldCheck,
  Circle,
  BookOpen,
  FileText,
  Loader2,
} from 'lucide-vue-next'
import { rsaService } from '@/services/rsaService'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCard from '@/components/common/BaseCard.vue'

// State
const selectedKeySize = ref(2048)
const isGenerating = ref(false)
const generatedKeys = ref(null)
const demoMessage = ref('')
const demoEncrypted = ref('')
const isEncrypting = ref(false)
const encryptionStatus = ref('')

// Generation Steps
const generationSteps = ref([
  {
    title: 'Generate Prime Numbers',
    description: 'Finding two large prime numbers (p and q)',
    icon: 'Hash',
    active: false,
    success: false,
  },
  {
    title: 'Calculate Modulus',
    description: 'Computing n = p × q',
    icon: 'Calculator',
    active: false,
    success: false,
  },
  {
    title: 'Calculate Totient',
    description: 'Computing φ(n) = (p-1) × (q-1)',
    icon: 'Function',
    active: false,
    success: false,
  },
  {
    title: 'Choose Public Exponent',
    description: 'Selecting e (commonly 65537)',
    icon: 'KeyRound',
    active: false,
    success: false,
  },
  {
    title: 'Calculate Private Exponent',
    description: 'Computing d ≡ e⁻¹ mod φ(n)',
    icon: 'Key',
    active: false,
    success: false,
  },
])

// Watch for demo message changes
watch(demoMessage, async (newValue) => {
  if (!newValue || !generatedKeys.value) {
    demoEncrypted.value = ''
    return
  }

  isEncrypting.value = true
  encryptionStatus.value = 'Encrypting message with public key...'

  await new Promise((resolve) => setTimeout(resolve, 1000))

  try {
    demoEncrypted.value = rsaService.encryptMessage(generatedKeys.value.publicKey, newValue)
    encryptionStatus.value = 'Message encrypted successfully!'
  } catch (err) {
    encryptionStatus.value = 'Encryption failed: ' + err.message
  } finally {
    isEncrypting.value = false
  }
})

// Functions
async function startGeneration() {
  isGenerating.value = true
  generatedKeys.value = null

  // Reset steps
  generationSteps.value.forEach((step) => {
    step.active = false
    step.success = false
  })

  try {
    // Simulate generation process with steps
    for (let i = 0; i < generationSteps.value.length; i++) {
      generationSteps.value[i].active = true
      await new Promise((resolve) => setTimeout(resolve, 1000))
      generationSteps.value[i].success = true

      if (i < generationSteps.value.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    // Actually generate the keys
    generatedKeys.value = rsaService.generateKeyPair(selectedKeySize.value)
  } finally {
    isGenerating.value = false
  }
}

function truncateKey(key) {
  if (!key) return ''
  const lines = key.split('\n')
  return lines[0] + '\n' + '...' + '\n' + lines[lines.length - 1]
}

async function copyPublicKey() {
  await navigator.clipboard.writeText(generatedKeys.value?.publicKey || '')
}

async function copyPrivateKey() {
  await navigator.clipboard.writeText(generatedKeys.value?.privateKey || '')
}

function getSecurityLevel() {
  const levels = {
    1024: 'Basic security (not recommended for sensitive data)',
    2048: 'Strong security (recommended for most uses)',
    4096: 'Very strong security (future-proof)',
  }
  return levels[selectedKeySize.value]
}

function getMaxMessageLength() {
  return rsaService.getMaxMessageLength(selectedKeySize.value)
}

function getTimeToBreak() {
  const times = {
    1024: 'Few months with powerful hardware',
    2048: 'Billions of years with current technology',
    4096: 'Practically impossible with any known technology',
  }
  return times[selectedKeySize.value]
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
