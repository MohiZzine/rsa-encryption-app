// src/stores/operationsStore.js
import { defineStore } from 'pinia'

export const useOperationsStore = defineStore('operations', {
  state: () => ({
    operations: []
  }),

  actions: {
    addOperation(operation) {
      this.operations.unshift({
        ...operation,
        timestamp: new Date().toISOString()
      })
      // Keep only last 10 operations
      if (this.operations.length > 10) {
        this.operations.pop()
      }
      this.saveToLocalStorage()
    },

    loadFromLocalStorage() {
      const stored = localStorage.getItem('rsa_operations')
      if (stored) {
        this.operations = JSON.parse(stored)
      }
    },

    saveToLocalStorage() {
      localStorage.setItem('rsa_operations', JSON.stringify(this.operations))
    }
  },

  getters: {
    recentOperations: (state) => state.operations,
    
    operationStats: (state) => {
      return state.operations.reduce((stats, op) => {
        stats[op.type] = (stats[op.type] || 0) + 1
        return stats
      }, {})
    }
  }
})