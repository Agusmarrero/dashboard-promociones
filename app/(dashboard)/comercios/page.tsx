'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Store, List, Map } from 'lucide-react'
import { useComercios, useComercioMutations } from '@/hooks'
import { PageHeader, EmptyState, LoadingPage } from '@/components/shared'
import { ComercioTable, ComercioForm, ComerciosMap } from '@/components/comercios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEPARTAMENTOS } from '@/constants/departamentos'
import type { Comercio, TipoComercio } from '@/types'
import { toast } from 'sonner'

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

export default function ComerciosPage() {
  const { comercios, loading, refetch } = useComercios()
  const { create, loading: mutationLoading } = useComercioMutations()
  const [formOpen, setFormOpen] = useState(false)
  const [view, setView] = useState<'lista' | 'mapa'>('lista')
  const [search, setSearch] = useState('')
  const [filterDepartamento, setFilterDepartamento] = useState<string>('all')
  const [filterTipo, setFilterTipo] = useState<string>('all')
  const [filterActivo, setFilterActivo] = useState<string>('all')

  const filteredComercios = useMemo(() => {
    return comercios.filter((comercio) => {
      const matchesSearch =
        comercio.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (comercio.localidad || '').toLowerCase().includes(search.toLowerCase()) ||
        comercio.nombreContacto.toLowerCase().includes(search.toLowerCase())
      const matchesDepartamento =
        filterDepartamento === 'all' || comercio.departamento === filterDepartamento
      const matchesTipo =
        filterTipo === 'all' || comercio.tipo === filterTipo
      const matchesActivo =
        filterActivo === 'all' ||
        (filterActivo === 'activo' && comercio.activo) ||
        (filterActivo === 'inactivo' && !comercio.activo)
      return matchesSearch && matchesDepartamento && matchesTipo && matchesActivo
    })
  }, [comercios, search, filterDepartamento, filterTipo, filterActivo])

  const handleCreate = async (data: Omit<Comercio, 'id' | 'creadoEn'>) => {
    try {
      await create(data)
      toast.success('Comercio creado correctamente')
      refetch()
    } catch {
      toast.error('Error al crear el comercio')
    }
  }

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comercios"
        description={`${comercios.length} comercios registrados`}
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar comercio
          </Button>
        }
      />

      <div className="flex items-center gap-2 border rounded-lg p-1 w-fit">
        <Button
          variant={view === 'lista' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('lista')}
          className="gap-2"
        >
          <List className="h-4 w-4" />
          Lista
        </Button>
        <Button
          variant={view === 'mapa' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('mapa')}
          className="gap-2"
        >
          <Map className="h-4 w-4" />
          Mapa
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre, localidad o contacto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterDepartamento} onValueChange={setFilterDepartamento}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los departamentos</SelectItem>
            {DEPARTAMENTOS.map((dep) => (
              <SelectItem key={dep} value={dep}>
                {dep}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {TIPOS_COMERCIO.map((tipo) => (
              <SelectItem key={tipo} value={tipo}>
                {tipo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterActivo} onValueChange={setFilterActivo}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="activo">Activos</SelectItem>
            <SelectItem value="inactivo">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {view === 'mapa' ? (
        <ComerciosMap comercios={filteredComercios} />
      ) : filteredComercios.length === 0 ? (
        <EmptyState
          icon={Store}
          title="Sin comercios"
          description={
            search || filterDepartamento !== 'all' || filterTipo !== 'all'
              ? 'No se encontraron comercios con los filtros aplicados'
              : 'Todavía no hay comercios registrados'
          }
          action={
            !search && filterDepartamento === 'all' && filterTipo === 'all' ? (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar primer comercio
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ComercioTable comercios={filteredComercios} />
      )}

      <ComercioForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        loading={mutationLoading}
      />
    </div>
  )
}
