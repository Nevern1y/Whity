import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useUserStore } from '@/lib/store/user-store'

export function useSyncUserImage() {
  const { data: session } = useSession()
  const { userImage, userId, setUserImage, setUserId, reset } = useUserStore()

  // Сброс при смене пользователя
  useEffect(() => {
    if (session?.user?.id !== userId) {
      reset()
      if (session?.user?.id) {
        setUserId(session.user.id)
      }
    }
  }, [session?.user?.id, userId, setUserId, reset])

  const updateUserImage = (image: string | null) => {
    if (session?.user?.id === userId) {
      setUserImage(image)
    }
  }

  return { updateUserImage, userImage }
} 