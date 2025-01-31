"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, Upload } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function UploadProfilePhoto() {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Пожалуйста, загрузите изображение")
      return
    }

    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) throw new Error('Failed to upload file')
      
      toast.success('Фото профиля обновлено')
      setIsOpen(false)
      // Принудительно обновляем страницу для отображения нового фото
      window.location.reload()
    } catch (error) {
      toast.error('Не удалось обновить фото')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          disabled={isLoading}
        >
          <Camera className="mr-2 h-4 w-4" />
          Загрузить фото
        </Button>
        <Button
          variant="outline"
          className="text-destructive"
          onClick={() => toast.error('Функция в разработке')}
        >
          Удалить
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Загрузить фото профиля</DialogTitle>
            <DialogDescription>
              Перетащите изображение или нажмите для выбора файла
            </DialogDescription>
          </DialogHeader>
          
          <div
            className={`
              relative rounded-lg border-2 border-dashed p-12 text-center
              ${dragActive ? "border-primary bg-primary/10" : "border-muted"}
              transition-colors
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
              disabled={isLoading}
            />
            
            {isLoading ? (
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-muted-foreground" />
            ) : (
              <div>
                <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  PNG, JPG до 10MB
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 