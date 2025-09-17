import type { Question, UserAnswer, PersistedFile, PersistedQuizData } from '@/types'

export class FilePersistenceManager {
  private readonly dbName = 'BinaryBrainDB'
  private readonly dbVersion = 1
  private readonly metadataKey = 'binaryBrain_persistedData'
  private readonly fileStoreKey = 'binaryBrain_fileStore'

  private db: IDBDatabase | null = null

  constructor() {
    this.initIndexedDB()
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported. Using localStorage fallback.')
        resolve()
        return
      }

      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        console.warn('IndexedDB error. Using localStorage fallback.', request.error)
        resolve()
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = () => {
        const db = request.result

        // Create file store
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' })
        }

        // Create metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' })
        }
      }
    })
  }

  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async saveFile(file: File): Promise<PersistedFile> {
    const fileId = this.generateFileId()

    const persistedFile: PersistedFile = {
      id: fileId,
      originalName: file.name,
      storedPath: fileId, // Use fileId as storage key
      uploadedAt: new Date(),
      size: file.size,
      type: file.type
    }

    // Try IndexedDB first for larger files
    if (this.db) {
      try {
        const fileBuffer = await file.arrayBuffer()
        await this.saveToIndexedDB(fileId, {
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          data: fileBuffer,
          uploadedAt: new Date()
        })
        return persistedFile
      } catch (error) {
        console.warn('IndexedDB save failed, falling back to localStorage:', error)
      }
    }

    // Fallback to localStorage for smaller files
    if (file.size < 5 * 1024 * 1024) { // 5MB limit
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      localStorage.setItem(`file_${fileId}`, base64Data)
      return persistedFile
    }

    throw new Error('File too large for browser storage (5MB limit)')
  }

  private async saveToIndexedDB(fileId: string, fileData: any): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not available')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readwrite')
      const store = transaction.objectStore('files')
      const request = store.put(fileData)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async loadFromIndexedDB(fileId: string): Promise<any> {
    if (!this.db) throw new Error('IndexedDB not available')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readonly')
      const store = transaction.objectStore('files')
      const request = store.get(fileId)

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result)
        } else {
          reject(new Error('File not found'))
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async loadFile(persistedFile: PersistedFile): Promise<File> {
    // Try IndexedDB first
    if (this.db) {
      try {
        const fileData = await this.loadFromIndexedDB(persistedFile.id)
        return new File([fileData.data], persistedFile.originalName, {
          type: persistedFile.type
        })
      } catch (error) {
        console.warn('IndexedDB load failed, trying localStorage:', error)
      }
    }

    // Fallback to localStorage
    const base64Data = localStorage.getItem(`file_${persistedFile.id}`)
    if (base64Data) {
      const response = await fetch(base64Data)
      const blob = await response.blob()
      return new File([blob], persistedFile.originalName, { type: persistedFile.type })
    }

    throw new Error('File not found in storage')
  }

  async saveQuizData(data: PersistedQuizData): Promise<void> {
    const dataToSave = {
      ...data,
      lastModified: new Date()
    }

    // Save to localStorage as primary storage
    localStorage.setItem(this.metadataKey, JSON.stringify(dataToSave))

    // Try to also save to IndexedDB as backup
    if (this.db) {
      try {
        await this.saveMetadataToIndexedDB(dataToSave)
      } catch (error) {
        console.warn('Could not save metadata to IndexedDB:', error)
      }
    }
  }

  private async saveMetadataToIndexedDB(data: PersistedQuizData): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not available')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readwrite')
      const store = transaction.objectStore('metadata')
      const request = store.put({
        key: this.metadataKey,
        data: data
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  loadQuizData(): PersistedQuizData | null {
    try {
      const stored = localStorage.getItem(this.metadataKey)
      if (stored) {
        const data = JSON.parse(stored)
        // Convert date strings back to Date objects
        data.lastModified = new Date(data.lastModified)
        data.file.uploadedAt = new Date(data.file.uploadedAt)
        if (data.quizState?.startTime) {
          data.quizState.startTime = new Date(data.quizState.startTime)
        }
        if (data.quizState?.endTime) {
          data.quizState.endTime = new Date(data.quizState.endTime)
        }
        return data
      }
    } catch (error) {
      console.error('Error loading quiz data from localStorage:', error)
    }
    return null
  }

  async clearPersistedData(): Promise<void> {
    // Get current data to know what files to clean up
    const data = this.loadQuizData()

    // Clear localStorage
    localStorage.removeItem(this.metadataKey)
    if (data) {
      localStorage.removeItem(`file_${data.file.id}`)
    }

    // Clear IndexedDB
    if (this.db && data) {
      try {
        await this.deleteFromIndexedDB(data.file.id)
        await this.deleteMetadataFromIndexedDB()
      } catch (error) {
        console.warn('Error clearing IndexedDB:', error)
      }
    }
  }

  private async deleteFromIndexedDB(fileId: string): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readwrite')
      const store = transaction.objectStore('files')
      const request = store.delete(fileId)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async deleteMetadataFromIndexedDB(): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readwrite')
      const store = transaction.objectStore('metadata')
      const request = store.delete(this.metadataKey)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  hasPersistedData(): boolean {
    return localStorage.getItem(this.metadataKey) !== null
  }
}

// Singleton instance
export const filePersistenceManager = new FilePersistenceManager()