import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UserStore {
  userImage: string | null
  setUserImage: (image: string | null) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userImage: null,
      setUserImage: (image) => set({ userImage: image }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => {
        // Проверяем доступность localStorage
        try {
          localStorage.setItem('test', 'test')
          localStorage.removeItem('test')
          return localStorage
        } catch {
          // Если localStorage недоступен, используем in-memory storage
          let storage: Record<string, string> = {}
          return {
            getItem: (key) => storage[key] || null,
            setItem: (key, value) => { storage[key] = value },
            removeItem: (key) => { delete storage[key] }
          }
        }
      })
    }
  )
) 