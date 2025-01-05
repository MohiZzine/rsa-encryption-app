<!-- src/App.vue -->
<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto max-w-6xl px-4">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">RSA Cryptography System</h1>
      <div class="space-y-8">
        <DashboardView />
        <KeyManagementView />
        <div class="grid md:grid-cols-2 gap-8">
          <MessageOperations />
          <MessageSignature />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import DashboardView from '@/views/DashboardView.vue'
import KeyManagementView from '@/views/KeyManagementView.vue'
import MessageOperations from '@/components/message/MessageOperations.vue'
import MessageSignature from '@/components/message/MessageSignature.vue'
</script>
