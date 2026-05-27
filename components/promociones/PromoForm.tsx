'use client'

import { useState } from 'react'
import type { Promocion, EstadoPromocion } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FlyerUpload } from './FlyerUpload'
import { format } from 'date-fns'

interface PromoFormProps {
  onSubmit: (
    data: Omit<Promocion, 'id' | 'creadaEn'>,
    flyerFile?: File
  ) => Promise<void>
  initialData?: Partial<Promocion>
  loading?: boolean
}

export function PromoForm({
  onSubmit,
  initialData,
  loading = false,
}: PromoFormProps) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    descripcion: initialData?.descripcion || '',
    vigenciaDesde: initialData?.vigenciaDesde
      ? format(initialData.vigenciaDesde, 'yyyy-MM-dd')
      : '',
    vigenciaHasta: initialData?.vigenciaHasta
      ? format(initialData.vigenciaHasta, 'yyyy-MM-dd')
      : '',
    estado: initialData?.estado || ('borrador' as EstadoPromocion),
  })
  const [flyerFile, setFlyerFile] = useState<File | null>(null)
  const [flyerPreview, setFlyerPreview] = useState<string | null>(
    initialData?.flyerUrl || null
  )

  const handleFileChange = (file: File | null) => {
    setFlyerFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFlyerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFlyerPreview(initialData?.flyerUrl || null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await onSubmit(
      {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        vigenciaDesde: new Date(formData.vigenciaDesde),
        vigenciaHasta: new Date(formData.vigenciaHasta),
        estado: formData.estado,
        flyerUrl: initialData?.flyerUrl || '',
        flyerPath: initialData?.flyerPath || '',
      },
      flyerFile || undefined
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData?.id ? 'Editar promoción' : 'Nueva promoción'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la promoción</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Ej: Promoción de verano 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Describe la promoción..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vigenciaDesde">Vigencia desde</Label>
              <Input
                id="vigenciaDesde"
                type="date"
                value={formData.vigenciaDesde}
                onChange={(e) =>
                  setFormData({ ...formData, vigenciaDesde: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vigenciaHasta">Vigencia hasta</Label>
              <Input
                id="vigenciaHasta"
                type="date"
                value={formData.vigenciaHasta}
                onChange={(e) =>
                  setFormData({ ...formData, vigenciaHasta: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value: EstadoPromocion) =>
                setFormData({ ...formData, estado: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="borrador">Borrador</SelectItem>
                <SelectItem value="activa">Activa</SelectItem>
                <SelectItem value="vencida">Vencida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Flyer de la promoción</Label>
            <FlyerUpload
              value={flyerPreview}
              onChange={handleFileChange}
              required={!initialData?.flyerUrl}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading || (!initialData?.flyerUrl && !flyerFile)}
            >
              {loading ? 'Guardando...' : 'Guardar promoción'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
