'use client'

import { useState, useEffect } from 'react'
import type { Cliente, Estacion } from '@/types'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ClienteFormProps {
  estaciones: Estacion[]
  onSubmit: (data: Omit<Cliente, 'id' | 'creadoEn'>) => Promise<void>
  initialData?: Partial<Cliente>
  preselectedEstacionId?: string
  loading?: boolean
}

export function ClienteForm({
  estaciones,
  onSubmit,
  initialData,
  preselectedEstacionId,
  loading = false,
}: ClienteFormProps) {
  const [formData, setFormData] = useState({
    estacionId: initialData?.estacionId || preselectedEstacionId || '',
    nombreContacto: initialData?.nombreContacto || '',
    telefonoWhatsapp: initialData?.telefonoWhatsapp || '',
    email: initialData?.email || '',
    notas: initialData?.notas || '',
    activo: initialData?.activo ?? true,
  })

  const availableEstaciones = estaciones.filter(
    (e) => !e.esCliente || e.id === initialData?.estacionId
  )

  const selectedEstacion = estaciones.find((e) => e.id === formData.estacionId)

  useEffect(() => {
    if (preselectedEstacionId && !formData.estacionId) {
      setFormData((prev) => ({ ...prev, estacionId: preselectedEstacionId }))
    }
  }, [preselectedEstacionId, formData.estacionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEstacion) return

    await onSubmit({
      ...formData,
      estacionNombre: selectedEstacion.nombre,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData?.id ? 'Editar cliente' : 'Nuevo cliente'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="estacionId">Estación de servicio</Label>
            <Select
              value={formData.estacionId}
              onValueChange={(value) =>
                setFormData({ ...formData, estacionId: value })
              }
              disabled={!!preselectedEstacionId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estación" />
              </SelectTrigger>
              <SelectContent>
                {availableEstaciones.map((estacion) => (
                  <SelectItem key={estacion.id} value={estacion.id}>
                    {estacion.nombre} - {estacion.localidad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableEstaciones.length === 0 && (
              <p className="text-sm text-amber-600">
                Todas las estaciones ya tienen un cliente asociado
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombreContacto">Nombre del contacto</Label>
            <Input
              id="nombreContacto"
              value={formData.nombreContacto}
              onChange={(e) =>
                setFormData({ ...formData, nombreContacto: e.target.value })
              }
              placeholder="Nombre y apellido"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefonoWhatsapp">Teléfono WhatsApp</Label>
              <Input
                id="telefonoWhatsapp"
                value={formData.telefonoWhatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, telefonoWhatsapp: e.target.value })
                }
                placeholder="+59899123456"
                required
              />
              <p className="text-xs text-slate-500">
                Formato internacional: +598XXXXXXXX
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="contacto@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) =>
                setFormData({ ...formData, notas: e.target.value })
              }
              placeholder="Notas adicionales sobre el cliente..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, activo: checked === true })
              }
            />
            <Label htmlFor="activo" className="font-normal">
              Cliente activo (recibe promociones)
            </Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading || !formData.estacionId}>
              {loading ? 'Guardando...' : 'Guardar cliente'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
