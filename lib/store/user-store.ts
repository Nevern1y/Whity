import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from 'next-auth'

interface UserStore {
  userImage: string | null
  userId: string | null
  user: User | null
  setUserImage: (image: string | null) => void
  setUserId: (id: string | null) => void
  setUser: (user: User | null) => void
  reset: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userImage: null,
      userId: null,
      user: null,
      setUserImage: (image) => {
        set({ userImage: image })
        // Update user object if it exists
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, image } })
        }
      },
      setUserId: (id) => set({ userId: id }),
      setUser: (user) => {
        set({ 
          user,
          userId: user?.id || null,
          userImage: user?.image || null
        })
      },
      reset: () => set({ userImage: null, userId: null, user: null })
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => {
        // Check localStorage availability
        try {
          localStorage.setItem('test', 'test')
          localStorage.removeItem('test')
          return localStorage
        } catch {
          // If localStorage is not available, use in-memory storage
          let storage: Record<string, string> = {}
          return {
            getItem: (key) => storage[key] || null,
            setItem: (key, value) => { storage[key] = value },
            removeItem: (key) => { delete storage[key] }
          }
        }
      }),
      partialize: (state) => ({
        userImage: state.userImage,
        userId: state.userId,
        user: state.user
      })
    }
  )
) 