// src/stores/keyStore.js
import { defineStore } from 'pinia'

export const useKeyStore = defineStore('keys', {
  state: () => ({
    keyPairs: []
  }),

  actions: {
    addKeyPair(keyPair) {
      this.keyPairs.push(keyPair)
      this.saveToLocalStorage()
    },

    deleteKeyPair(index) {
      this.keyPairs.splice(index, 1)
      this.saveToLocalStorage()
    },

    loadFromLocalStorage() {
      const stored = localStorage.getItem('rsa_keypairs')
      if (stored) {
        this.keyPairs = JSON.parse(stored)
      }
    },

    saveToLocalStorage() {
      localStorage.setItem('rsa_keypairs', JSON.stringify(this.keyPairs))
    }
  }
})