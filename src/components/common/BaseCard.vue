<!-- src/components/common/BaseCard.vue -->
<template>
  <div
    class="bg-white rounded-lg shadow-lg transform transition-all duration-300"
    :class="[
      hover && 'hover:shadow-xl hover:scale-[1.01]',
      !flat && 'p-6'
    ]"
  >
    <div v-if="$slots.header" 
         class="flex items-center justify-between mb-4">
      <slot name="header" />
    </div>

    <slot />

    <div v-if="$slots.footer" 
         class="mt-4 pt-4 border-t">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  hover: {
    type: Boolean,
    default: false
  },
  flat: {
    type: Boolean,
    default: false
  }
})
</script>