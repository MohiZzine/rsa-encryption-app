// src/services/rsaService.js
import JSEncrypt from 'jsencrypt'
import CryptoJS from 'crypto-js'

export class RSAService {
  generateKeyPair(keySize = 2048) {
    const encrypt = new JSEncrypt({ default_key_size: `${keySize}` })
    encrypt.getKey()

    return {
      publicKey: encrypt.getPublicKey(),
      privateKey: encrypt.getPrivateKey(),
      keySize,
      createdAt: new Date().toISOString(),
    }
  }

  encryptMessage(publicKey, message) {
    const encrypt = new JSEncrypt()
    encrypt.setPublicKey(publicKey)

    // If message is too long, split it into chunks
    const maxLength = this.getMaxMessageLength(this.getKeySize(publicKey))
    if (message.length > maxLength) {
      const chunks = []
      for (let i = 0; i < message.length; i += maxLength) {
        const chunk = message.slice(i, i + maxLength)
        const encryptedChunk = encrypt.encrypt(chunk)
        if (!encryptedChunk) return false
        chunks.push(encryptedChunk)
      }
      return JSON.stringify(chunks) // Return array of encrypted chunks
    }

    return encrypt.encrypt(message)
  }

  decryptMessage(privateKey, encryptedMessage) {
    const encrypt = new JSEncrypt()
    encrypt.setPrivateKey(privateKey)

    try {
      // Try parsing as JSON (might be chunked)
      const chunks = JSON.parse(encryptedMessage)
      if (Array.isArray(chunks)) {
        return chunks.map((chunk) => encrypt.decrypt(chunk)).join('')
      }
    } catch {
      // Not JSON, treat as single encrypted message
      return encrypt.decrypt(encryptedMessage)
    }
  }

  signMessage(privateKey, message) {
    const encrypt = new JSEncrypt()
    encrypt.setPrivateKey(privateKey)

    // Create SHA-256 hash of the message
    const messageHash = CryptoJS.SHA256(message).toString()

    // Sign the hash
    const signature = encrypt.sign(messageHash, CryptoJS.SHA256, 'sha256')

    return {
      message,
      signature,
      hash: messageHash,
    }
  }

  verifySignature(publicKey, message, signature) {
    const encrypt = new JSEncrypt()
    encrypt.setPublicKey(publicKey)

    // Create hash of the message to verify - must match the signing process
    const messageHash = CryptoJS.SHA256(message).toString()

    // Verify the signature against the hash
    return encrypt.verify(messageHash, signature, CryptoJS.SHA256)
  }

  getKeySize(publicKey) {
    // Estimate key size from public key length
    const cleanKey = publicKey
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/[\n\r\s]/g, '')

    const sizeInBytes = (cleanKey.length * 3) / 4 // Base64 to bytes
    return Math.round((sizeInBytes * 8) / 1.5) // Approximate bit length
  }

  getMaxMessageLength(keySize) {
    return Math.floor(keySize / 8) - 11 // PKCS#1 v1.5 padding
  }

  validateKey(key, type) {
    const headerRegex =
      type === 'public' ? /^-----BEGIN PUBLIC KEY-----/ : /^-----BEGIN RSA PRIVATE KEY-----/
    const footerRegex =
      type === 'public' ? /-----END PUBLIC KEY-----$/ : /-----END RSA PRIVATE KEY-----$/

    return headerRegex.test(key) && footerRegex.test(key)
  }
}

export const rsaService = new RSAService()
