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
  DialogTrigger,
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

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Размер файла не должен превышать 10MB")
      return
    }

    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to upload file')
      }

      const { success, url } = await response.json()

      if (!success) {
        throw new Error('Failed to upload file')
      }

      toast.success("Фото профиля обновлено")
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Не удалось загрузить фото')
    } finally {
      setIsLoading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={isLoading}
        >
          <Camera className="mr-2 h-4 w-4" />
          Загрузить фото
        </Button>
      </DialogTrigger>

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
  )
} 