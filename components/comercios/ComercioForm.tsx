'use client'

import { useState } from 'react'
import type { Comercio, TipoComercio } from '@/types'
import { DEPARTAMENTOS } from '@/constants/departamentos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

const TIPOS_COMERCIO: TipoComercio[] = [
  'OTROS',
  'PROMOCIONAL DIRECTO',
  'Cadenas chicas y super',
  'PROMOCIONALES DIST',
  'FLORERIAS',
  'RESTAURANT',
  'BAZAR',
  'FARMACIA',
  'OTRO',
]

interface ComercioFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<Comercio, 'id' | 'creadoEn'>) => Promise<void>
  initialData?: Partial<Comercio>
  loading?: boolean
}

export function ComercioForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  loading = false,
}: ComercioFormProps) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    tipo: initialData?.tipo || 'OTROS' as TipoComercio,
    nombreContacto: initialData?.nombreContacto || '',
    telefonoWhatsapp: initialData?.telefonoWhatsapp || '',
    email: initialData?.email || '',
    direccion: initialData?.direccion || '',
    localidad: initialData?.localidad || '',
    departamento: initialData?.departamento || '',
    activo: initialData?.activo ?? true,
    notas: initialData?.notas || '',
    codigoExterno: initialData?.codigoExterno || '',
    latitud: initialData?.latitud?.toString() || '',
    longitud: initialData?.longitud?.toString() || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const lat = parseFloat(formData.latitud)
    const lng = parseFloat(formData.longitud)
    await onSubmit({
      nombre: formData.nombre,
      tipo: formData.tipo,
      nombreContacto: formData.nombreContacto,
      telefonoWhatsapp: formData.telefonoWhatsapp,
      email: formData.email || undefined,
      direccion: formData.direccion || undefined,
      localidad: formData.localidad || undefined,
      departamento: formData.departamento || undefined,
      activo: formData.activo,
      notas: formData.notas || undefined,
      codigoExterno: formData.codigoExterno || undefined,
      latitud: isNaN(lat) ? undefined : lat,
      longitud: isNaN(lng) ? undefined : lng,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Editar comercio' : 'Nuevo comercio'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Nombre del comercio"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value: TipoComercio) =>
                setFormData({ ...formData, tipo: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_COMERCIO.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombreContacto">Nombre de contacto</Label>
            <Input
              id="nombreContacto"
              value={formData.nombreContacto}
              onChange={(e) => setFormData({ ...formData, nombreContacto: e.target.value })}
              placeholder="Nombre del contacto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefonoWhatsapp">Teléfono WhatsApp</Label>
            <Input
              id="telefonoWhatsapp"
              value={formData.telefonoWhatsapp}
              onChange={(e) => setFormData({ ...formData, telefonoWhatsapp: e.target.value })}
              placeholder="+598..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@ejemplo.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departamento">Departamento</Label>
              <Select
                value={formData.departamento}
                onValueChange={(value) => setFormData({ ...formData, departamento: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTAMENTOS.map((dep) => (
                    <SelectItem key={dep} value={dep}>
                      {dep}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="localidad">Localidad</Label>
              <Input
                id="localidad"
                value={formData.localidad}
                onChange={(e) => setFormData({ ...formData, localidad: e.target.value })}
                placeholder="Localidad"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección (opcional)</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              placeholder="Dirección"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitud">Latitud (opcional)</Label>
              <Input
                id="latitud"
                type="number"
                step="any"
                value={formData.latitud}
                onChange={(e) => setFormData({ ...formData, latitud: e.target.value })}
                placeholder="-34.9011"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitud">Longitud (opcional)</Label>
              <Input
                id="longitud"
                type="number"
                step="any"
                value={formData.longitud}
                onChange={(e) => setFormData({ ...formData, longitud: e.target.value })}
                placeholder="-56.1645"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
