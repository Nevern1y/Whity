import { useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useUserStore } from '@/lib/store/user-store'

export function useSyncUserImage() {
  const { data: session, update } = useSession()
  const { userImage, userId, setUserImage, setUserId, reset, setUser } = useUserStore()

  // Reset when user changes
  useEffect(() => {
    if (!session?.user) {
      reset()
      return
    }

    // Initial sync
    if (session.user.id !== userId) {
      setUser(session.user)
    }

    // Sync image if different
    if (session.user.image !== userImage) {
      setUserImage(session.user.image || null)
    }
  }, [session, reset, setUser, userId, userImage, setUserImage])

  const updateUserImage = useCallback(async (image: string | null) => {
    if (!session?.user?.id) return

    try {
      // Optimistic update in store
      setUserImage(image)

      // Update server state first
      const response = await fetch('/api/user/image', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      })

      if (!response.ok) {
        throw new Error('Failed to update image')
      }

      // Wait for the server update to complete
      await new Promise(resolve => setTimeout(resolve, 100))

      // Trigger session update to refresh the token
      await update()

      // Update complete user data in store
      setUser({
        ...session.user,
        image
      })

    } catch (error) {
      // Revert on error
      setUserImage(session.user.image || null)
      throw error
    }
  }, [session, setUserImage, update, setUser])

  return { 
    updateUserImage, 
    userImage: userImage || session?.user?.image || null 
  }
} 