"use client"

import { useState } from "react"
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ImageCropDialogProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  onCropComplete: (croppedImageUrl: string) => void
}

export function ImageCropDialog({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  })
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null)

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    setImageRef(e.currentTarget)
  }

  function getCroppedImg() {
    if (!imageRef) return

    const canvas = document.createElement('canvas')
    const scaleX = imageRef.naturalWidth / imageRef.width
    const scaleY = imageRef.naturalHeight / imageRef.height
    canvas.width = crop.width
    canvas.height = crop.height
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.drawImage(
      imageRef,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )

    canvas.toBlob((blob) => {
      if (!blob) return
      onCropComplete(URL.createObjectURL(blob))
      onClose()
    }, 'image/jpeg', 1)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Обрезать изображение</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ReactCrop
            crop={crop}
            onChange={c => setCrop(c)}
            aspect={1}
            circularCrop
          >
            <img src={imageSrc} onLoad={onImageLoad} />
          </ReactCrop>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={getCroppedImg}>
            Применить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 