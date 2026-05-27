'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FlyerUploadProps {
  value: string | null
  onChange: (file: File | null) => void
  required?: boolean
}

export function FlyerUpload({ value, onChange, required }: FlyerUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, seleccioná una imagen válida')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar los 5MB')
        return
      }
      onChange(file)
    }
  }

  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        required={required && !value}
      />

      {value ? (
        <div className="relative">
          <div className="relative aspect-[4/3] max-w-md rounded-lg overflow-hidden border border-slate-200">
            <Image
              src={value}
              alt="Preview del flyer"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center w-full max-w-md aspect-[4/3]',
            'border-2 border-dashed border-slate-300 rounded-lg',
            'hover:border-blue-400 hover:bg-blue-50/50 transition-colors',
            'cursor-pointer'
          )}
        >
          <Upload className="h-10 w-10 text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-600">
            Click para subir imagen
          </p>
          <p className="text-xs text-slate-400 mt-1">
            JPG, PNG o WebP (máx. 5MB)
          </p>
        </button>
      )}
    </div>
  )
}
