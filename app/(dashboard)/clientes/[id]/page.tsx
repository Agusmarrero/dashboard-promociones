'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Phone,
  Mail,
  Building2,
  Calendar,
  Edit,
  Trash2,
  MessageSquare,
  FileText,
} from 'lucide-react'
import { useCliente, useClienteMutations, useEstaciones } from '@/hooks'
import { desmarcarComoCliente } from '@/lib/firebase/estaciones'
import { getEnviosByClienteId } from '@/lib/firebase/envios'
import { PageHeader, LoadingPage, ConfirmDialog } from '@/components/shared'
import { ClienteForm } from '@/components/clientes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import type { Cliente, Envio } from '@/types'

export default function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { cliente, loading, refetch } = useCliente(id)
  const { estaciones, loading: loadingEstaciones } = useEstaciones()
  const { update, remove, loading: mutationLoading } = useClienteMutations()
  const [editMode, setEditMode] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [envios, setEnvios] = useState<Envio[]>([])
  const [loadingEnvios, setLoadingEnvios] = useState(true)

  useEffect(() => {
    if (id) {
      getEnviosByClienteId(id)
        .then(setEnvios)
        .finally(() => setLoadingEnvios(false))
    }
  }, [id])

  const handleUpdate = async (data: Omit<Cliente, 'id' | 'creadoEn'>) => {
    try {
      await update(id, data)
      toast.success('Cliente actualizado correctamente')
      setEditMode(false)
      refetch()
    } catch {
      toast.error('Error al actualizar el cliente')
    }
  }

  const handleDelete = async () => {
    if (!cliente) return
    try {
      await desmarcarComoCliente(cliente.estacionId)
      await remove(id)
      toast.success('Cliente eliminado correctamente')
      router.push('/clientes')
    } catch {
      toast.error('Error al eliminar el cliente')
    }
  }

  if (loading || loadingEstaciones) return <LoadingPage />

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Cliente no encontrado</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/clientes">Volver a clientes</Link>
        </Button>
      </div>
    )
  }

  if (editMode) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setEditMode(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title="Editar cliente"
            description={cliente.nombreContacto}
          />
        </div>
        <ClienteForm
          estaciones={estaciones}
          onSubmit={handleUpdate}
          initialData={cliente}
          loading={mutationLoading}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/clientes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={cliente.nombreContacto}
          description={cliente.estacionNombre}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {cliente.activo ? (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Activo
          </Badge>
        ) : (
          <Badge variant="secondary">Inactivo</Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información de contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Estación</p>
                <Link
                  href={`/estaciones/${cliente.estacionId}`}
                  className="font-medium hover:text-blue-600"
                >
                  {cliente.estacionNombre}
                </Link>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">WhatsApp</p>
                <p className="font-medium">{cliente.telefonoWhatsapp}</p>
              </div>
            </div>
            {cliente.email && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium">{cliente.email}</p>
                  </div>
                </div>
              </>
            )}
            <Separator />
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Cliente desde</p>
                <p className="font-medium">
                  {format(cliente.creadoEn, "d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            </div>
            {cliente.notas && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Notas</p>
                    <p className="font-medium">{cliente.notas}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setEditMode(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar cliente
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar cliente
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Promociones recibidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEnvios ? (
                <p className="text-sm text-slate-500">Cargando...</p>
              ) : envios.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Este cliente aún no ha recibido promociones
                </p>
              ) : (
                <ul className="space-y-3">
                  {envios.slice(0, 5).map((envio) => (
                    <li
                      key={envio.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <Link
                        href={`/promociones/${envio.promocionId}`}
                        className="font-medium hover:text-blue-600"
                      >
                        {envio.promocionNombre}
                      </Link>
                      <span className="text-slate-500">
                        {format(envio.fecha, 'dd/MM/yyyy')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar cliente"
        description="¿Estás seguro de que querés eliminar este cliente? La estación volverá a estado 'No cliente'. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
        loading={mutationLoading}
      />
    </div>
  )
}
