<!-- src/views/SecureMessagingView.vue -->
<template>
  <div class="space-y-8">
    <BaseCard>
      <template #header>
        <div class="flex items-center gap-3">
          <MessageCircle class="w-6 h-6 text-blue-500" />
          <h2 class="text-xl font-bold">Interactive Secure Messaging Demo</h2>
        </div>
      </template>

      <!-- Steps Progress -->
      <div class="mb-8">
        <div class="flex justify-between mb-2">
          <div class="w-1/3 text-center" v-for="(step, index) in steps" :key="index">
            <div
              class="w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-all duration-300 mb-2"
              :class="[
                currentStep > index
                  ? 'bg-green-500 text-white'
                  : currentStep === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500',
              ]"
            >
              <component :is="step.icon" class="w-4 h-4" />
            </div>
            <div
              class="text-sm font-medium"
              :class="currentStep === index ? 'text-blue-600' : 'text-gray-600'"
            >
              {{ step.title }}
            </div>
          </div>
        </div>
        <div class="relative pt-1">
          <div class="flex mb-2">
            <div
              class="transition-all duration-500 h-2 bg-blue-500 rounded-full"
              :style="{ width: `${(currentStep / (steps.length - 1)) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="space-y-6">
        <!-- Step 1: Key Generation -->
        <div v-if="currentStep === 0">
          <h3 class="text-lg font-medium mb-4">Generate RSA Key Pairs</h3>
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Alice's Keys -->
            <div class="p-4 border rounded-lg">
              <div class="flex items-center gap-2 mb-4">
                <User class="w-5 h-5 text-purple-500" />
                <h4 class="font-medium">Alice</h4>
              </div>
              <div v-if="!aliceKeys" class="space-y-4">
                <p class="text-sm text-gray-600">Generate Alice's RSA key pair:</p>
                <BaseButton
                  @click="generateAliceKeys"
                  variant="primary"
                  :loading="generatingAlice"
                  block
                >
                  <template #icon>
                    <Key class="w-4 h-4" />
                  </template>
                  Generate Keys
                </BaseButton>
              </div>
              <div v-else class="space-y-2">
                <div class="flex items-center gap-2 text-green-500 text-sm">
                  <CheckCircle class="w-4 h-4" />
                  Keys Generated Successfully
                </div>
                <div class="text-xs text-gray-500">Bob's Public Key Available for Alice</div>
              </div>
            </div>

            <!-- Bob's Keys -->
            <div class="p-4 border rounded-lg">
              <div class="flex items-center gap-2 mb-4">
                <User class="w-5 h-5 text-green-500" />
                <h4 class="font-medium">Bob</h4>
              </div>
              <div v-if="!bobKeys" class="space-y-4">
                <p class="text-sm text-gray-600">Generate Bob's RSA key pair:</p>
                <BaseButton
                  @click="generateBobKeys"
                  variant="primary"
                  :loading="generatingBob"
                  block
                >
                  <template #icon>
                    <Key class="w-4 h-4" />
                  </template>
                  Generate Keys
                </BaseButton>
              </div>
              <div v-else class="space-y-2">
                <div class="flex items-center gap-2 text-green-500 text-sm">
                  <CheckCircle class="w-4 h-4" />
                  Keys Generated Successfully
                </div>
                <div class="text-xs text-gray-500">Bob's Private Key Available for Bob</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Message Composition & Encryption -->
        <div v-if="currentStep === 1">
          <h3 class="text-lg font-medium mb-4">Compose & Encrypt Message</h3>

          <div class="grid md:grid-cols-2 gap-6">
            <!-- Message Composition -->
            <div class="space-y-4">
              <div class="flex items-center gap-2 mb-2">
                <User class="w-5 h-5 text-purple-500" />
                <h4 class="font-medium">Alice's Message to Bob</h4>
              </div>

              <textarea
                v-model="aliceMessage"
                placeholder="Type your secret message for Bob..."
                class="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              ></textarea>

              <div class="flex justify-between text-sm text-gray-500">
                <span>Using Bob's Public Key for Encryption</span>
                <span>{{ aliceMessage.length }} characters</span>
              </div>

              <BaseButton
                @click="encryptMessage"
                :loading="encrypting"
                :disabled="!aliceMessage"
                variant="primary"
                block
              >
                <template #icon>
                  <Lock class="w-4 h-4" />
                </template>
                Encrypt Message
              </BaseButton>
            </div>

            <!-- Encryption Process Visualization -->
            <div v-if="encryptionSteps.length > 0" class="border rounded-lg p-4 space-y-4">
              <h4 class="font-medium">Encryption Process</h4>

              <TransitionGroup name="list" tag="div" class="space-y-2">
                <div
                  v-for="(step, index) in encryptionSteps"
                  :key="index"
                  class="text-sm p-2 rounded"
                  :class="[step.active ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600']"
                >
                  <div class="flex items-center gap-2">
                    <component
                      :is="step.icon"
                      class="w-4 h-4"
                      :class="step.active ? 'text-blue-500' : 'text-gray-400'"
                    />
                    {{ step.text }}
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>

        <!-- Step 3: Message Delivery & Decryption -->
        <div v-if="currentStep === 2">
          <h3 class="text-lg font-medium mb-4">Message Delivery & Decryption</h3>

          <div class="grid md:grid-cols-2 gap-6">
            <!-- Encrypted Message -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Lock class="w-5 h-5 text-blue-500" />
                  <h4 class="font-medium">Encrypted Message</h4>
                </div>
                <button
                  @click="deliverMessage"
                  class="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                >
                  <Send class="w-4 h-4" />
                  Deliver to Bob
                </button>
              </div>

              <div class="p-3 bg-gray-50 rounded-lg break-all text-sm font-mono">
                {{ encryptedMessage || 'No encrypted message yet' }}
              </div>
            </div>

            <!-- Bob's Decryption -->
            <div class="space-y-4">
              <div class="flex items-center gap-2 mb-2">
                <User class="w-5 h-5 text-green-500" />
                <h4 class="font-medium">Bob's Decryption</h4>
              </div>

              <div v-if="!messageDelivered" class="text-center py-8 text-gray-500">
                Waiting for message delivery...
              </div>

              <template v-else>
                <div class="space-y-4">
                  <BaseButton @click="decryptMessage" :loading="decrypting" variant="success" block>
                    <template #icon>
                      <Unlock class="w-4 h-4" />
                    </template>
                    Decrypt with Private Key
                  </BaseButton>

                  <Transition name="fade">
                    <div v-if="decryptedMessage" class="space-y-2">
                      <div class="flex items-center gap-2 text-green-500">
                        <CheckCircle class="w-4 h-4" />
                        <span class="text-sm font-medium">Decryption Successful!</span>
                      </div>
                      <div class="p-3 bg-green-50 rounded-lg text-green-700">
                        {{ decryptedMessage }}
                      </div>
                    </div>
                  </Transition>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between mt-8">
          <BaseButton v-if="currentStep > 0" @click="currentStep--" variant="secondary">
            <template #icon>
              <ChevronLeft class="w-4 h-4" />
            </template>
            Previous Step
          </BaseButton>

          <BaseButton
            v-if="currentStep < steps.length - 1"
            @click="proceedToNextStep"
            variant="primary"
            class="ml-auto"
          >
            Next Step
            <template #icon>
              <ChevronRight class="w-4 h-4" />
            </template>
          </BaseButton>

          <BaseButton v-else @click="resetDemo" variant="primary" class="ml-auto">
            <template #icon>
              <RefreshCw class="w-4 h-4" />
            </template>
            Start New Demo
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <!-- Educational Info -->
    <BaseCard class="bg-gray-50">
      <div class="prose max-w-none">
        <h3 class="flex items-center gap-2">
          <Info class="w-5 h-5 text-blue-500" />
          How RSA Secure Messaging Works
        </h3>

        <p class="text-gray-600">
          This demo illustrates the fundamental principles of RSA encryption in secure messaging:
        </p>

        <ol class="list-decimal pl-5 space-y-2 text-gray-600">
          <li>
            <strong>Key Generation:</strong> Each participant generates their own pair of keys:
            <ul class="list-disc pl-5 mt-1">
              <li>A public key that can be freely shared</li>
              <li>A private key that must be kept secret</li>
            </ul>
          </li>
          <li>
            <strong>Message Encryption:</strong> When Alice wants to send a message to Bob:
            <ul class="list-disc pl-5 mt-1">
              <li>She uses Bob's public key to encrypt the message</li>
              <li>The encrypted message can only be decrypted with Bob's private key</li>
              <li>Even Alice cannot decrypt her own message once encrypted</li>
            </ul>
          </li>
          <li>
            <strong>Secure Transmission:</strong> The encrypted message can be safely transmitted
            over any channel because:
            <ul class="list-disc pl-5 mt-1">
              <li>It's mathematically infeasible to decrypt without the private key</li>
              <li>Interceptors cannot read the message contents</li>
            </ul>
          </li>
          <li>
            <strong>Message Decryption:</strong> When Bob receives the message:
            <ul class="list-disc pl-5 mt-1">
              <li>He uses his private key to decrypt it</li>
              <li>The decryption process recovers the original message</li>
            </ul>
          </li>
        </ol>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  User,
  Key,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  MessageCircle,
  Send,
  Info,
  RefreshCw,
} from 'lucide-vue-next'
import { rsaService } from '@/services/rsaService'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCard from '@/components/common/BaseCard.vue'

// State
const currentStep = ref(0)
const aliceKeys = ref(null)
const bobKeys = ref(null)
const aliceMessage = ref('')
const encryptedMessage = ref('')
const decryptedMessage = ref('')
const generatingAlice = ref(false)
const generatingBob = ref(false)
const encrypting = ref(false)
const decrypting = ref(false)
const messageDelivered = ref(false)
const encryptionSteps = ref([])

// Steps configuration
const steps = [
  { title: 'Generate Keys', icon: Key },
  { title: 'Encrypt Message', icon: Lock },
  { title: 'Decrypt Message', icon: Unlock },
]

// Generate keys with animation delay
async function generateAliceKeys() {
  generatingAlice.value = true
  await new Promise((resolve) => setTimeout(resolve, 1000))
  aliceKeys.value = rsaService.generateKeyPair(2048)
  generatingAlice.value = false
}

async function generateBobKeys() {
  generatingBob.value = true
  await new Promise((resolve) => setTimeout(resolve, 1000))
  bobKeys.value = rsaService.generateKeyPair(2048)
  generatingBob.value = false
}

// Encrypt message with animated steps
async function encryptMessage() {
  if (!aliceMessage.value) return

  encrypting.value = true
  encryptionSteps.value = [
    { text: 'Preparing message...', icon: MessageCircle, active: true },
    { text: "Getting Bob's public key...", icon: Key, active: false },
    { text: 'Encrypting with RSA...', icon: Lock, active: false },
    { text: 'Encryption complete!', icon: CheckCircle, active: false },
  ]

  try {
    // Step 1: Prepare message
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Step 2: Get public key
    encryptionSteps.value[0].active = false
    encryptionSteps.value[1].active = true
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Step 3: Encrypt
    encryptionSteps.value[1].active = false
    encryptionSteps.value[2].active = true
    await new Promise((resolve) => setTimeout(resolve, 1000))
    encryptedMessage.value = rsaService.encryptMessage(bobKeys.value.publicKey, aliceMessage.value)

    // Step 4: Complete
    encryptionSteps.value[2].active = false
    encryptionSteps.value[3].active = true
  } finally {
    encrypting.value = false
  }
}

// Deliver message to Bob
async function deliverMessage() {
  messageDelivered.value = true
}

// Decrypt message with animation
async function decryptMessage() {
  decrypting.value = true
  await new Promise((resolve) => setTimeout(resolve, 1500))

  try {
    decryptedMessage.value = rsaService.decryptMessage(
      bobKeys.value.privateKey,
      encryptedMessage.value,
    )
  } finally {
    decrypting.value = false
  }
}

// Navigation control
function proceedToNextStep() {
  if (currentStep.value === 0 && (!aliceKeys.value || !bobKeys.value)) {
    return
  }

  if (currentStep.value === 1 && !encryptedMessage.value) {
    return
  }

  currentStep.value++
}

// Reset the demo
function resetDemo() {
  currentStep.value = 0
  aliceKeys.value = null
  bobKeys.value = null
  aliceMessage.value = ''
  encryptedMessage.value = ''
  decryptedMessage.value = ''
  messageDelivered.value = false
  encryptionSteps.value = []
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
  transform: translateX(30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Add smooth transition for background and border colors */
.fade-bg {
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}
</style>
