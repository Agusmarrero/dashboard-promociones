'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, Tag } from 'lucide-react'
import { usePromociones } from '@/hooks'
import { PageHeader, EmptyState, LoadingPage } from '@/components/shared'
import { PromoCard } from '@/components/promociones'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EstadoPromocion } from '@/types'

export default function PromocionesPage() {
  const { promociones, loading } = usePromociones()
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('all')

  const filteredPromociones = useMemo(() => {
    return promociones.filter((promo) => {
      const matchesSearch = promo.nombre
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchesEstado =
        filterEstado === 'all' || promo.estado === filterEstado
      return matchesSearch && matchesEstado
    })
  }, [promociones, search, filterEstado])

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promociones"
        description={`${promociones.length} promociones registradas`}
        action={
          <Button asChild>
            <Link href="/promociones/nueva">
              <Plus className="h-4 w-4 mr-2" />
              Nueva promoción
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="borrador">Borrador</SelectItem>
            <SelectItem value="activa">Activa</SelectItem>
            <SelectItem value="vencida">Vencida</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredPromociones.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Sin promociones"
          description={
            search || filterEstado !== 'all'
              ? 'No se encontraron promociones con los filtros aplicados'
              : 'Todavía no hay promociones registradas'
          }
          action={
            !search && filterEstado === 'all' ? (
              <Button asChild>
                <Link href="/promociones/nueva">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera promoción
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPromociones.map((promo) => (
            <PromoCard key={promo.id} promocion={promo} />
          ))}
        </div>
      )}
    </div>
  )
}
