<!-- src/components/demo/SecureMessageExchange.vue -->
<template>
  <BaseCard class="mb-8">
    <template #header>
      <div class="flex items-center gap-2">
        <Users class="w-6 h-6 text-blue-500" />
        <h2 class="text-xl font-bold">Secure Message Exchange Demo</h2>
      </div>
    </template>

    <!-- Users Section -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Alice's Panel -->
      <div class="border rounded-lg p-4">
        <div class="flex items-center gap-2 mb-4">
          <UserCircle class="w-5 h-5 text-purple-500" />
          <h3 class="font-medium">Alice</h3>
        </div>

        <!-- Alice's Key Pair -->
        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-2">Alice's RSA Key Pair:</p>
          <button
            v-if="!aliceKeys"
            @click="generateAliceKeys"
            class="text-sm text-blue-500 hover:text-blue-600"
          >
            Generate Keys
          </button>
          <div v-else class="text-sm bg-gray-50 p-2 rounded">
            <p class="text-gray-500">Public Key Available ✓</p>
          </div>
        </div>

        <!-- Alice's Message to Bob -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Message to Bob:</label>
          <textarea
            v-model="aliceMessage"
            placeholder="Type a secret message for Bob..."
            class="w-full p-2 border rounded h-24 text-sm"
          ></textarea>
        </div>

        <BaseButton
          @click="aliceSendMessage"
          :disabled="!canAliceSend"
          variant="primary"
          size="sm"
          block
        >
          <template #icon>
            <Send class="w-4 h-4" />
          </template>
          Send Encrypted Message
        </BaseButton>
      </div>

      <!-- Bob's Panel -->
      <div class="border rounded-lg p-4">
        <div class="flex items-center gap-2 mb-4">
          <UserCircle class="w-5 h-5 text-green-500" />
          <h3 class="font-medium">Bob</h3>
        </div>

        <!-- Bob's Key Pair -->
        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-2">Bob's RSA Key Pair:</p>
          <button
            v-if="!bobKeys"
            @click="generateBobKeys"
            class="text-sm text-blue-500 hover:text-blue-600"
          >
            Generate Keys
          </button>
          <div v-else class="text-sm bg-gray-50 p-2 rounded">
            <p class="text-gray-500">Public Key Available ✓</p>
          </div>
        </div>

        <!-- Bob's Received Messages -->
        <div>
          <label class="block text-sm font-medium mb-1">Received Messages:</label>
          <div v-if="bobMessages.length === 0" class="text-sm text-gray-500">
            No messages yet
          </div>
          <div v-else>
            <div
              v-for="(msg, index) in bobMessages"
              :key="index"
              class="bg-gray-50 p-3 rounded mb-2 text-sm"
            >
              <div class="flex justify-between items-start gap-2">
                <p>{{ msg.decrypted }}</p>
                <div class="flex gap-1">
                  <span class="text-xs text-gray-500">
                    {{ msg.verified ? '✓ Verified' : 'Not Verified' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Demo Steps -->
    <div class="mt-6 p-4 bg-blue-50 rounded-lg">
      <h4 class="font-medium mb-2 flex items-center gap-2">
        <Info class="w-5 h-5 text-blue-500" />
        How it works:
      </h4>
      <ol class="text-sm text-gray-600 list-decimal pl-5 space-y-1">
        <li>Both users generate their RSA key pairs</li>
        <li>Alice writes a message for Bob</li>
        <li>System encrypts the message using Bob's public key</li>
        <li>Alice signs the message with her private key</li>
        <li>Bob decrypts the message using his private key</li>
        <li>Bob verifies the signature using Alice's public key</li>
      </ol>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { UserCircle, Users, Send, Info } from 'lucide-vue-next'
import { rsaService } from '@/services/rsaService'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCard from '@/components/common/BaseCard.vue'

const aliceKeys = ref(null)
const bobKeys = ref(null)
const aliceMessage = ref('')
const bobMessages = ref([])

const generateAliceKeys = () => {
  aliceKeys.value = rsaService.generateKeyPair(2048)
}

const generateBobKeys = () => {
  bobKeys.value = rsaService.generateKeyPair(2048)
}

const canAliceSend = computed(() => {
  return aliceKeys.value && bobKeys.value && aliceMessage.value.trim()
})

const aliceSendMessage = () => {
  try {
    // Encrypt message with Bob's public key
    const encrypted = rsaService.encryptMessage(
      bobKeys.value.publicKey,
      aliceMessage.value
    )

    // Sign the original message with Alice's private key
    const signature = rsaService.signMessage(
      aliceKeys.value.privateKey,
      aliceMessage.value
    )

    // Bob decrypts the message with his private key
    const decrypted = rsaService.decryptMessage(
      bobKeys.value.privateKey,
      encrypted
    )

    // Bob verifies the signature with Alice's public key
    const verified = rsaService.verifySignature(
      aliceKeys.value.publicKey,
      aliceMessage.value,
      signature.signature
    )

    // Add to Bob's messages
    bobMessages.value.unshift({
      decrypted,
      verified,
      timestamp: new Date()
    })

    // Clear Alice's message
    aliceMessage.value = ''

  } catch (error) {
    console.error('Message exchange failed:', error)
  }
}
</script>