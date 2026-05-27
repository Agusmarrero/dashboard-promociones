'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Users,
  Tag,
  Send,
  ArrowRight,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import { PageHeader, LoadingPage } from '@/components/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getEstaciones } from '@/lib/firebase/estaciones'
import { getClientes } from '@/lib/firebase/clientes'
import { getPromocionesActivas } from '@/lib/firebase/promociones'
import { getUltimoEnvio } from '@/lib/firebase/envios'
import type { Estacion, Cliente, Promocion, Envio } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface DashboardStats {
  totalEstaciones: number
  totalClientes: number
  promocionesActivas: number
  ultimoEnvio: Envio | null
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalEstaciones: 0,
    totalClientes: 0,
    promocionesActivas: 0,
    ultimoEnvio: null,
  })
  const [promociones, setPromociones] = useState<Promocion[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [estaciones, clientes, promos, ultimoEnvio] = await Promise.all([
          getEstaciones(),
          getClientes(),
          getPromocionesActivas(),
          getUltimoEnvio(),
        ])

        setStats({
          totalEstaciones: estaciones.length,
          totalClientes: clientes.filter((c) => c.activo).length,
          promocionesActivas: promos.length,
          ultimoEnvio,
        })
        setPromociones(promos.slice(0, 3))
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen de tu gestión de promociones"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Estaciones
            </CardTitle>
            <MapPin className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEstaciones}</div>
            <p className="text-xs text-slate-500 mt-1">
              Estaciones registradas en Uruguay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Clientes Activos
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-slate-500 mt-1">
              {stats.totalEstaciones > 0
                ? `${Math.round(
                    (stats.totalClientes / stats.totalEstaciones) * 100
                  )}% de las estaciones`
                : 'Sin estaciones'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Promociones Activas
            </CardTitle>
            <Tag className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.promocionesActivas}</div>
            <p className="text-xs text-slate-500 mt-1">
              Promociones en vigencia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Último Envío
            </CardTitle>
            <Send className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            {stats.ultimoEnvio ? (
              <>
                <div className="text-2xl font-bold">
                  {stats.ultimoEnvio.totalEnviados}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  mensajes el{' '}
                  {format(stats.ultimoEnvio.fecha, 'dd/MM/yyyy', { locale: es })}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-slate-500 mt-1">Sin envíos aún</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Accesos Rápidos</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/estaciones">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Ver todas las estaciones
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/clientes/nuevo">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Agregar nuevo cliente
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/promociones/nueva">
                <span className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Crear nueva promoción
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Promociones Activas</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/promociones">Ver todas</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {promociones.length === 0 ? (
              <div className="text-center py-6">
                <Tag className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  No hay promociones activas
                </p>
                <Button asChild variant="link" size="sm" className="mt-2">
                  <Link href="/promociones/nueva">Crear una promoción</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {promociones.map((promo) => (
                  <div
                    key={promo.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <Link
                        href={`/promociones/${promo.id}`}
                        className="font-medium hover:text-blue-600"
                      >
                        {promo.nombre}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Calendar className="h-3 w-3" />
                        {promo.vigenciaHasta
                          ? `Hasta ${format(promo.vigenciaHasta, 'dd/MM/yyyy', { locale: es })}`
                          : 'Hasta agotar stock'}
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Activa</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
