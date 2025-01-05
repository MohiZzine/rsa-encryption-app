<!-- src/views/DashboardView.vue -->
<template>
  <div class="bg-white rounded-lg shadow-lg p-6 space-y-6">
    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Key Pairs -->
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white
                  transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-100">Active Key Pairs</p>
            <h3 class="text-3xl font-bold">{{ keyStore.keyPairs.length }}</h3>
          </div>
          <Key class="w-8 h-8 text-blue-200" />
        </div>
      </div>

      <!-- Total Operations -->
      <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-4 text-white
                  transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-indigo-100">Total Operations</p>
            <h3 class="text-3xl font-bold">{{ operationsStore.operations.length }}</h3>
          </div>
          <Activity class="w-8 h-8 text-indigo-200" />
        </div>
      </div>

      <!-- Latest Activity -->
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white
                  transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-purple-100">Latest Activity</p>
            <h3 class="text-lg font-medium truncate">
              {{ latestActivity }}
            </h3>
          </div>
          <Clock class="w-8 h-8 text-purple-200" />
        </div>
      </div>
    </div>

    <!-- Operation Type Distribution -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <ChartBar class="w-5 h-5 text-gray-600" />
        Operation Distribution
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div v-for="(count, type) in operationStats" :key="type"
             class="bg-white rounded-lg p-3 shadow-sm
                    transform transition-all duration-300 hover:shadow-md">
          <div class="text-sm text-gray-600 capitalize">{{ type }}</div>
          <div class="text-2xl font-bold" :class="operationTypeColor(type)">
            {{ count }}
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Operations -->
    <div>
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <History class="w-5 h-5 text-gray-600" />
        Recent Operations
      </h3>
      
      <TransitionGroup 
        name="list" 
        tag="div"
        class="space-y-3"
      >
        <div v-for="operation in operationsStore.recentOperations" 
             :key="operation.timestamp"
             class="bg-white border rounded-lg p-3 flex items-center gap-3
                    transform transition-all duration-300 hover:shadow-md">
          <div class="p-2 rounded-full"
               :class="operationTypeBg(operation.type)">
            <component :is="operationTypeIcon(operation.type)" 
                      class="w-5 h-5 text-white" />
          </div>
          <div class="flex-1">
            <div class="font-medium">{{ operation.type }}</div>
            <div class="text-sm text-gray-500">
              {{ new Date(operation.timestamp).toLocaleString() }}
            </div>
          </div>
          <div class="text-xs text-gray-500">
            {{ timeAgo(operation.timestamp) }}
          </div>
        </div>
      </TransitionGroup>

      <!-- Empty State -->
      <div v-if="operationsStore.operations.length === 0"
           class="text-center py-8 text-gray-500">
        <Activity class="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No operations recorded yet</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  Key, Activity, Clock, History, ChartBar,
  Lock, Unlock, PenTool, CheckCircle2
} from 'lucide-vue-next'
import { useKeyStore } from '@/stores/keyStore'
import { useOperationsStore } from '@/stores/operationsStore'

const keyStore = useKeyStore()
const operationsStore = useOperationsStore()

const latestActivity = computed(() => {
  const latest = operationsStore.operations[0]
  return latest ? `${latest.type} - ${timeAgo(latest.timestamp)}` : 'No activity'
})

const operationStats = computed(() => operationsStore.operationStats)

function operationTypeColor(type) {
  const colors = {
    'encrypt': 'text-blue-600',
    'decrypt': 'text-green-600',
    'sign': 'text-indigo-600',
    'verify': 'text-purple-600'
  }
  return colors[type] || 'text-gray-600'
}

function operationTypeBg(type) {
  const colors = {
    'encrypt': 'bg-blue-500',
    'decrypt': 'bg-green-500',
    'sign': 'bg-indigo-500',
    'verify': 'bg-purple-500'
  }
  return colors[type] || 'bg-gray-500'
}

function operationTypeIcon(type) {
  const icons = {
    'encrypt': Lock,
    'decrypt': Unlock,
    'sign': PenTool,
    'verify': CheckCircle2
  }
  return icons[type] || Activity
}

function timeAgo(timestamp) {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000)
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  }
  
  for (let [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`
    }
  }
  
  return 'just now'
}
</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
</style>