'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  Send,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { usePromocion, usePromocionMutations, useClientesActivos } from '@/hooks'
import { getEnviosByPromocionId } from '@/lib/firebase/envios'
import { uploadFlyer, deleteFlyer } from '@/lib/storage'
import { PageHeader, LoadingPage, ConfirmDialog } from '@/components/shared'
import { PromoForm, EnvioModal } from '@/components/promociones'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import type { Promocion, Envio } from '@/types'

const estadoBadgeStyles = {
  borrador: 'bg-slate-100 text-slate-700',
  activa: 'bg-green-100 text-green-700',
  vencida: 'bg-red-100 text-red-700',
}

const estadoLabels = {
  borrador: 'Borrador',
  activa: 'Activa',
  vencida: 'Vencida',
}

export default function PromocionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { promocion, loading, refetch } = usePromocion(id)
  const { clientes, loading: loadingClientes } = useClientesActivos()
  const { update, remove } = usePromocionMutations()
  const [editMode, setEditMode] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [envioOpen, setEnvioOpen] = useState(false)
  const [mutationLoading, setMutationLoading] = useState(false)
  const [envios, setEnvios] = useState<Envio[]>([])
  const [loadingEnvios, setLoadingEnvios] = useState(true)

  useEffect(() => {
    if (id) {
      getEnviosByPromocionId(id)
        .then(setEnvios)
        .finally(() => setLoadingEnvios(false))
    }
  }, [id])

  const fetchEnvios = () => {
    setLoadingEnvios(true)
    getEnviosByPromocionId(id)
      .then(setEnvios)
      .finally(() => setLoadingEnvios(false))
  }

  const handleUpdate = async (
    data: Omit<Promocion, 'id' | 'creadaEn'>,
    flyerFile?: File
  ) => {
    if (!promocion) return
    try {
      setMutationLoading(true)

      let flyerUrl = data.flyerUrl
      let flyerPath = data.flyerPath

      if (flyerFile) {
        if (promocion.flyerPath) {
          await deleteFlyer(promocion.flyerPath).catch(() => {})
        }
        const uploaded = await uploadFlyer(id, flyerFile)
        flyerUrl = uploaded.url
        flyerPath = uploaded.path
      }

      await update(id, { ...data, flyerUrl, flyerPath })
      toast.success('Promoción actualizada correctamente')
      setEditMode(false)
      refetch()
    } catch {
      toast.error('Error al actualizar la promoción')
    } finally {
      setMutationLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!promocion) return
    try {
      setMutationLoading(true)
      if (promocion.flyerPath) {
        await deleteFlyer(promocion.flyerPath).catch(() => {})
      }
      await remove(id)
      toast.success('Promoción eliminada correctamente')
      router.push('/promociones')
    } catch {
      toast.error('Error al eliminar la promoción')
    } finally {
      setMutationLoading(false)
    }
  }

  if (loading || loadingClientes) return <LoadingPage />

  if (!promocion) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Promoción no encontrada</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/promociones">Volver a promociones</Link>
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
            title="Editar promoción"
            description={promocion.nombre}
          />
        </div>
        <PromoForm
          onSubmit={handleUpdate}
          initialData={promocion}
          loading={mutationLoading}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/promociones">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title={promocion.nombre} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Badge className={estadoBadgeStyles[promocion.estado]}>
          {estadoLabels[promocion.estado]}
        </Badge>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar className="h-4 w-4" />
          {promocion.vigenciaDesde || promocion.vigenciaHasta ? (
            <span>
              {promocion.vigenciaDesde
                ? format(promocion.vigenciaDesde, "d 'de' MMMM", { locale: es })
                : '?'}{' '}
              -{' '}
              {promocion.vigenciaHasta
                ? format(promocion.vigenciaHasta, "d 'de' MMMM 'de' yyyy", { locale: es })
                : 'sin vencimiento'}
            </span>
          ) : (
            <span>Hasta agotar stock</span>
          )}
        </div>
      </div>

      <Tabs defaultValue="detalle">
        <TabsList>
          <TabsTrigger value="detalle">Detalle</TabsTrigger>
          <TabsTrigger value="historial">Historial de envíos</TabsTrigger>
        </TabsList>

        <TabsContent value="detalle" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Flyer</CardTitle>
              </CardHeader>
              <CardContent>
                {promocion.flyerUrl ? (
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
                    <Image
                      src={promocion.flyerUrl}
                      alt={promocion.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] rounded-lg bg-slate-100 flex items-center justify-center">
                    <p className="text-slate-400">Sin flyer</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{promocion.descripcion}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Acciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {promocion.estado === 'activa' && (
                    <Button
                      className="w-full justify-start"
                      onClick={() => setEnvioOpen(true)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar por WhatsApp
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setEditMode(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar promoción
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar promoción
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="historial" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historial de envíos</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEnvios ? (
                <p className="text-sm text-slate-500">Cargando...</p>
              ) : envios.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Esta promoción aún no ha sido enviada
                </p>
              ) : (
                <div className="space-y-4">
                  {envios.map((envio) => (
                    <div
                      key={envio.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="h-4 w-4" />
                          {format(envio.fecha, "d 'de' MMMM 'de' yyyy, HH:mm", {
                            locale: es,
                          })}
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {envio.totalEnviados}
                          </Badge>
                          {envio.totalErrores > 0 && (
                            <Badge className="bg-red-100 text-red-700">
                              <XCircle className="h-3 w-3 mr-1" />
                              {envio.totalErrores}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-slate-600">
                        Enviado a {envio.destinatarios.length} destinatarios
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EnvioModal
        open={envioOpen}
        onOpenChange={setEnvioOpen}
        promocion={promocion}
        clientes={clientes}
        onComplete={fetchEnvios}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar promoción"
        description="¿Estás seguro de que querés eliminar esta promoción? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
        loading={mutationLoading}
      />
    </div>
  )
}
