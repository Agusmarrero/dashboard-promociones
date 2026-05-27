'use client'

import { useState } from 'react'
import type { Estacion, Marca } from '@/types'
import { DEPARTAMENTOS, MARCAS } from '@/constants/departamentos'
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

interface EstacionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<Estacion, 'id' | 'creadaEn' | 'actualizadaEn'>) => Promise<void>
  initialData?: Partial<Estacion>
  loading?: boolean
}

export function EstacionForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  loading = false,
}: EstacionFormProps) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    marca: initialData?.marca || 'ANCAP' as Marca,
    departamento: initialData?.departamento || '',
    localidad: initialData?.localidad || '',
    direccion: initialData?.direccion || '',
    telefono: initialData?.telefono || '',
    latitud: initialData?.latitud?.toString() || '',
    longitud: initialData?.longitud?.toString() || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const lat = parseFloat(formData.latitud)
    const lng = parseFloat(formData.longitud)
    await onSubmit({
      nombre: formData.nombre,
      marca: formData.marca,
      departamento: formData.departamento,
      localidad: formData.localidad,
      direccion: formData.direccion,
      telefono: formData.telefono,
      latitud: isNaN(lat) ? undefined : lat,
      longitud: isNaN(lng) ? undefined : lng,
      fuente: 'MANUAL',
      esCliente: initialData?.esCliente || false,
      clienteId: initialData?.clienteId || null,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Editar estación' : 'Nueva estación'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Nombre de la estación"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Select
                value={formData.marca}
                onValueChange={(value: Marca) =>
                  setFormData({ ...formData, marca: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARCAS.map((marca) => (
                    <SelectItem key={marca} value={marca}>
                      {marca}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="departamento">Departamento</Label>
              <Select
                value={formData.departamento}
                onValueChange={(value) =>
                  setFormData({ ...formData, departamento: value })
                }
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="localidad">Localidad</Label>
            <Input
              id="localidad"
              value={formData.localidad}
              onChange={(e) =>
                setFormData({ ...formData, localidad: e.target.value })
              }
              placeholder="Localidad"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
              placeholder="Dirección"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono (opcional)</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              placeholder="+598..."
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
                onChange={(e) =>
                  setFormData({ ...formData, latitud: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, longitud: e.target.value })
                }
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
