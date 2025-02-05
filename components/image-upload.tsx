"use client"

import { useCallback, useState, useRef } from "react"
import { toast } from "sonner"
import Image from "next/image"
import { Loader2, X, Upload } from "lucide-react"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  disabled
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(async (file: File) => {
    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      console.log('Upload response:', data)
      const imageUrl = `/uploads/${data.fileName}`
      console.log('Setting image URL:', imageUrl)
      onChange(imageUrl)
      toast.success('Изображение загружено')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Ошибка при загрузке изображения')
    } finally {
      setIsUploading(false)
    }
  }, [onChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }, [handleUpload])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleRemove = useCallback(() => {
    onChange('')
  }, [onChange])

  return (
    <div className="relative">
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled || isUploading}
      />
      {value ? (
        <div className="relative aspect-video mt-2">
          <Image
            alt="Upload"
            src={value}
            fill
            className="object-cover rounded-md"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 rounded-full bg-rose-500 shadow-sm"
            type="button"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed rounded-md hover:opacity-75 transition cursor-pointer"
        >
          {isUploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Перетащите изображение сюда или кликните для выбора
              </p>
              <span className="text-xs text-muted-foreground">
                Поддерживаются JPG, PNG
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 