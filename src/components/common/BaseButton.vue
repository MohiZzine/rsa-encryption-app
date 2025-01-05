<!-- src/components/common/BaseButton.vue -->
<template>
  <button
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
      'transition-all duration-300 transform',
      !disabled && 'hover:scale-105 active:scale-100',
      sizeClasses[size],
      variantClasses[variant],
      block && 'w-full',
      disabled && 'opacity-50 cursor-not-allowed'
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <BaseSpinner v-if="loading" size="sm" />
    <slot v-else name="icon" />
    <slot>{{ text }}</slot>
  </button>
</template>

<script setup>
/* eslint-disable no-unused-vars */


import BaseSpinner from './BaseSpinner.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => [
      'primary', 'secondary', 'success', 'danger', 'warning', 'info'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  text: {
    type: String,
    default: ''
  },
  block: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg'
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  success: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:shadow-lg',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg',
  warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md hover:shadow-lg',
  info: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md hover:shadow-lg'
}
</script>