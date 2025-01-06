<!-- src/App.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow">
      <div class="container mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex">
            <router-link
              to="/"
              class="flex items-center px-4 gap-2 transition-colors duration-300"
              :class="$route.path === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'"
            >
              <Shield class="w-5 h-5" />
              <span class="font-medium">RSA Demo</span>
            </router-link>
          </div>

          <div class="flex">
            <router-link
              to="/secure-messaging"
              class="flex items-center px-4 gap-2 transition-colors duration-300"
              :class="
                $route.path === '/secure-messaging'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              "
            >
              <MessageCircle class="w-5 h-5" />
              <span class="font-medium">Secure Messaging</span>
            </router-link>
          </div>

          <div class="flex">
            <router-link
              to="/file-encryption"
              class="flex items-center px-4 gap-2 transition-colors duration-300"
              :class="
                $route.path === '/file-encryption'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              "
            >
              <FileKey class="w-5 h-5" />
              <span class="font-medium">File Encryption</span>
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="py-8">
      <div class="container mx-auto px-4 max-w-6xl">
        <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">RSA Cryptography System</h1>
        <!-- Router View with Transition -->
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in" appear>
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { Shield, FileKey } from 'lucide-vue-next'
</script>

<style>
/* Page Transition Animations */
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
