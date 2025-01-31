import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NotificationSettings {
  email: boolean
  push: boolean
  updates: boolean
  comments: boolean
  mentions: boolean
}

interface SettingsState {
  theme: 'light' | 'dark' | 'system'
  profileBackground: string
  notificationSettings: NotificationSettings
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setProfileBackground: (background: string) => void
  setNotificationSettings: (settings: Partial<NotificationSettings>) => void
  resetSettings: () => void
}

const defaultSettings: Pick<SettingsState, 'theme' | 'profileBackground' | 'notificationSettings'> = {
  theme: 'system',
  profileBackground: 'gradient-1',
  notificationSettings: {
    email: true,
    push: true,
    updates: true,
    comments: true,
    mentions: true,
  },
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setTheme: (theme) => set({ theme }),
      setProfileBackground: (background) => set({ profileBackground: background }),
      setNotificationSettings: (settings) =>
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        })),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'user-settings',
    }
  )
) 