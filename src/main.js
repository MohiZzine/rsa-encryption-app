// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/styles/index.css'

// Create pinia instance
const pinia = createPinia()

// Create app
const app = createApp(App)

// Use plugins
app.use(pinia)

// Mount app
app.mount('#app')
