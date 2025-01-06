<!-- src/views/HomeView.vue -->
<template>
  <div class="space-y-8">
    <DashboardView />
    <KeyManagementView />
    <div class="grid md:grid-cols-2 gap-8">
      <MessageOperations />
      <MessageSignature />
    </div>
  </div>
</template>

<script setup>
import DashboardView from '@/views/DashboardView.vue'
import KeyManagementView from '@/views/KeyManagementView.vue'
import MessageOperations from '@/components/message/MessageOperations.vue'
import MessageSignature from '@/components/message/MessageSignature.vue'
</script>
