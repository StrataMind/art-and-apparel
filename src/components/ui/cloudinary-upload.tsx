'use client'

import { useState } from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import { Button } from './button'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface CloudinaryUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  onRemove: (url: string) => void
  disabled?: boolean
  multiple?: boolean
  folder?: string
  maxFiles?: number
}

export function CloudinaryUpload({
  value = [],
  onChange,
  onRemove,
  disabled,
  multiple = false,
  folder = 'findora',
  maxFiles = 5
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const onUpload = (result: any) => {
    if (result?.info?.secure_url) {
      const newUrl = result.info.secure_url
      if (multiple) {
        onChange([...value, newUrl])
      } else {
        onChange([newUrl])
      }
    }
    setIsUploading(false)
  }

  const canUploadMore = multiple ? value.length < maxFiles : value.length === 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {value.map((url, index) => (
          <div key={url} className="relative group">
            <div className="aspect-square relative rounded-lg overflow-hidden border">
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
            <Button
              type="button"
              onClick={() => onRemove(url)}
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </Button>
            {index === 0 && value.length > 1 && (
              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                Main
              </div>
            )}
          </div>
        ))}
      </div>

      {canUploadMore && (
        <CldUploadWidget
          uploadPreset="ml_default"
          options={{
            maxFiles: multiple ? maxFiles - value.length : 1,
            folder,
            resourceType: 'image',
            clientAllowedFormats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
            maxFileSize: 10000000, // 10MB
            cropping: false,
            multiple: multiple,
          }}
          onSuccess={onUpload}
          onError={(error) => {
            console.error('Upload error:', error)
            setIsUploading(false)
          }}
        >
          {({ open }) => (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsUploading(true)
                open?.()
              }}
              disabled={disabled || isUploading}
              className="w-full h-32 border-dashed"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6" />
                <span>
                  {isUploading 
                    ? 'Uploading...' 
                    : `Upload ${multiple ? 'Images' : 'Image'}`
                  }
                </span>
                {multiple && (
                  <span className="text-xs text-muted-foreground">
                    {value.length}/{maxFiles} images
                  </span>
                )}
              </div>
            </Button>
          )}
        </CldUploadWidget>
      )}
    </div>
  )
}

export default CloudinaryUpload