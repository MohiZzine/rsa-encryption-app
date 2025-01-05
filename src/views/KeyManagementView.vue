<!-- src/views/KeyManagementView.vue -->
<template>
  <div class="container mx-auto p-4 max-w-6xl">
    <h1 class="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-3">
      <ShieldIcon class="w-8 h-8 text-blue-500" />
      Key Management
    </h1>
    
    <div class="grid gap-6 md:grid-cols-2">
      <KeyGeneration />
      <KeyDisplay />
    </div>
  </div>
</template>

<script setup>
import { ShieldIcon } from 'lucide-vue-next'
import KeyGeneration from '@/components/key-management/KeyGeneration.vue'
import KeyDisplay from '@/components/key-management/KeyDisplay.vue'
</script>