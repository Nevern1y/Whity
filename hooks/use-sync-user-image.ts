import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useUserStore } from '@/lib/store/user-store'

export function useSyncUserImage() {
  const { data: session, update } = useSession()
  const { setUserImage, userImage } = useUserStore()

  useEffect(() => {
    const syncImage = async () => {
      if (session?.user?.image && session.user.image !== userImage) {
        setUserImage(session.user.image)
      }
    }
    syncImage()
  }, [session?.user?.image, setUserImage, userImage])

  // Добавляем функцию для обновления изображения
  const updateUserImage = async (newImageUrl: string) => {
    setUserImage(newImageUrl)
    await update({ image: newImageUrl })
  }

  return { updateUserImage }
} 