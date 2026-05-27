'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Building2,
  Calendar,
  Edit,
  Trash2,
  UserPlus,
  User,
} from 'lucide-react'
import { useEstacion, useEstacionMutations } from '@/hooks'
import { PageHeader, LoadingPage, ConfirmDialog } from '@/components/shared'
import { EstacionForm } from '@/components/estaciones'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { useState } from 'react'

export default function EstacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { estacion, loading, refetch } = useEstacion(id)
  const { update, remove, loading: mutationLoading } = useEstacionMutations()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleUpdate = async (data: Parameters<typeof update>[1]) => {
    try {
      await update(id, data)
      toast.success('Estación actualizada correctamente')
      refetch()
    } catch {
      toast.error('Error al actualizar la estación')
    }
  }

  const handleDelete = async () => {
    try {
      await remove(id)
      toast.success('Estación eliminada correctamente')
      router.push('/estaciones')
    } catch {
      toast.error('Error al eliminar la estación')
    }
  }

  if (loading) return <LoadingPage />

  if (!estacion) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Estación no encontrada</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/estaciones">Volver a estaciones</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/estaciones">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={estacion.nombre}
          description={`${estacion.localidad}, ${estacion.departamento}`}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{estacion.marca}</Badge>
        {estacion.esCliente ? (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Cliente
          </Badge>
        ) : (
          <Badge variant="secondary">No cliente</Badge>
        )}
        {estacion.fuente === 'MANUAL' && (
          <Badge variant="outline" className="text-amber-600 border-amber-300">
            Manual
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información general</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Ubicación</p>
                <p className="font-medium">
                  {estacion.localidad}, {estacion.departamento}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Dirección</p>
                <p className="font-medium">{estacion.direccion}</p>
              </div>
            </div>
            {estacion.telefono && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Teléfono</p>
                    <p className="font-medium">{estacion.telefono}</p>
                  </div>
                </div>
              </>
            )}
            <Separator />
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Registrada</p>
                <p className="font-medium">
                  {format(estacion.creadaEn, "d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {estacion.esCliente ? (
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href={`/clientes/${estacion.clienteId}`}>
                  <User className="h-4 w-4 mr-2" />
                  Ver cliente asociado
                </Link>
              </Button>
            ) : (
              <Button asChild className="w-full justify-start">
                <Link href={`/clientes/nuevo?estacionId=${estacion.id}`}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convertir en cliente
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setEditOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar estación
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar estación
            </Button>
          </CardContent>
        </Card>
      </div>

      <EstacionForm
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleUpdate}
        initialData={estacion}
        loading={mutationLoading}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar estación"
        description="¿Estás seguro de que querés eliminar esta estación? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
        loading={mutationLoading}
      />
    </div>
  )
}
