// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import FileEncryptionView from '@/views/FileEncryptionView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/file-encryption',
      name: 'file-encryption',
      component: FileEncryptionView
    },
    {
      path: '/secure-messaging',
      name: 'secure-messaging',
      component: () => import('@/views/SecureMessagingView.vue')
    }
  ]
})

export default router