"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form } from "@/components/ui/form"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { useUserStore } from "@/lib/store/user-store"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Mail } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { ImageCropDialog } from "@/components/image-crop-dialog"

interface ProfileFormProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
    createdAt?: Date | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { update } = useSession()
  const router = useRouter()
  const setUserImage = useUserStore((state) => state.setUserImage)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      image: user?.image || ""
    }
  })

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setCropDialogOpen(true)
  }

  const handleImageChange = async (url: string) => {
    try {
      form.setValue('image', url)
      setUserImage(url)
      await update({ image: url })
      
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: url })
      })

      if (!response.ok) throw new Error('Failed to update profile')
      
      router.refresh()
      toast.success('Фото профиля обновлено')
      setCropDialogOpen(false)
    } catch (error) {
      toast.error('Ошибка при обновлении фото профиля')
    }
  }

  return (
    <Form {...form}>
      <Card className="border-none shadow-none">
        <CardContent className="space-y-8 pt-4">
          <div className="space-y-6">
            <div className="flex justify-center">
              <AvatarUpload
                initialImage={user.image}
                onImageChange={handleImageSelect}
              />
            </div>

            <div className="space-y-4 text-center">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {user.name}
                </h2>
                <Badge variant="secondary" className="mt-2">
                  {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                </Badge>
              </div>

              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                {user.createdAt && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    На платформе с {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: ru })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ImageCropDialog
        isOpen={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        imageSrc={selectedImage || ''}
        onCropComplete={handleImageChange}
      />
    </Form>
  )
} 