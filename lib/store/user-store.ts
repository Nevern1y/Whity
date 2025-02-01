import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  userImage: string | null
  setUserImage: (image: string) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userImage: null,
      setUserImage: (image) => set({ userImage: image }),
    }),
    {
      name: 'user-storage',
    }
  )
) 