// src/services/fileService.js
import { rsaService } from './rsaService'

export class FileService {
  async encryptFile(file, publicKey) {
    try {
      // Read file as Base64
      const base64Content = await this.readFileAsBase64(file)

      // Create file metadata with content
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        content: base64Content,
      }

      // Encrypt the stringified data
      return rsaService.encryptMessage(publicKey, JSON.stringify(fileData))
    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Failed to encrypt file')
    }
  }

  async decryptFile(encryptedData, privateKey) {
    try {
      // Decrypt the data
      const decrypted = rsaService.decryptMessage(privateKey, encryptedData)

      // Parse the file data
      const fileData = JSON.parse(decrypted)

      // Convert Base64 back to Blob
      const blob = this.base64ToBlob(fileData.content, fileData.type)

      return {
        blob,
        name: fileData.name,
        type: fileData.type,
      }
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt file')
    }
  }

  readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        // Extract base64 data from the result
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  base64ToBlob(base64Data, type = 'application/octet-stream') {
    const byteCharacters = atob(base64Data)
    const byteArrays = []

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512)
      const byteNumbers = new Array(slice.length)

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }

      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }

    return new Blob(byteArrays, { type })
  }

  async readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  downloadFile(fileData) {
    const url = URL.createObjectURL(fileData.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileData.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

export const fileService = new FileService()
