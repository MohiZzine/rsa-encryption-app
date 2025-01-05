<!-- src/components/common/BaseAlert.vue -->
<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      :class="[
        'rounded-lg p-4 flex items-center gap-3',
        variantStyles[variant]
      ]"
    >
      <component 
        :is="variantIcon[variant]" 
        class="w-5 h-5 flex-shrink-0"
        :class="variantIconColor[variant]"
      />
      <div class="flex-1 flex justify-between gap-2">
        <div>
          <p class="font-medium" :class="variantTextColor[variant]">
            {{ title }}
          </p>
          <p v-if="message" class="text-sm" :class="variantMessageColor[variant]">
            {{ message }}
          </p>
        </div>
        <button
          v-if="dismissible"
          @click="$emit('dismiss')"
          class="flex-shrink-0 ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5
                 transition-colors duration-200 focus:outline-none"
          :class="variantCloseButtonClass[variant]"
        >
          <span class="sr-only">Dismiss</span>
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
/* eslint-disable no-unused-vars */


import { AlertCircle, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  variant: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  dismissible: {
    type: Boolean,
    default: false
  }
})

defineEmits(['dismiss'])

const variantStyles = {
  success: 'bg-green-50',
  error: 'bg-red-50',
  warning: 'bg-yellow-50',
  info: 'bg-blue-50'
}

const variantIcon = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: AlertCircle
}

const variantIconColor = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500'
}

const variantTextColor = {
  success: 'text-green-800',
  error: 'text-red-800',
  warning: 'text-yellow-800',
  info: 'text-blue-800'
}

const variantMessageColor = {
  success: 'text-green-700',
  error: 'text-red-700',
  warning: 'text-yellow-700',
  info: 'text-blue-700'
}

const variantCloseButtonClass = {
  success: 'bg-green-50 text-green-500 hover:bg-green-100',
  error: 'bg-red-50 text-red-500 hover:bg-red-100',
  warning: 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100',
  info: 'bg-blue-50 text-blue-500 hover:bg-blue-100'
}
</script>