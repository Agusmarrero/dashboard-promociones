'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, MapPin, List, Map } from 'lucide-react'
import { useEstaciones, useEstacionMutations } from '@/hooks'
import { PageHeader, EmptyState, LoadingPage } from '@/components/shared'
import { EstacionTable, EstacionForm, EstacionesMap } from '@/components/estaciones'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEPARTAMENTOS, MARCAS } from '@/constants/departamentos'
import type { Estacion } from '@/types'
import { toast } from 'sonner'

export default function EstacionesPage() {
  const { estaciones, loading, refetch } = useEstaciones()
  const { create, loading: mutationLoading } = useEstacionMutations()
  const [formOpen, setFormOpen] = useState(false)
  const [view, setView] = useState<'lista' | 'mapa'>('lista')
  const [search, setSearch] = useState('')
  const [filterDepartamento, setFilterDepartamento] = useState<string>('all')
  const [filterMarca, setFilterMarca] = useState<string>('all')
  const [filterCliente, setFilterCliente] = useState<string>('all')

  const filteredEstaciones = useMemo(() => {
    return estaciones.filter((estacion) => {
      const matchesSearch =
        estacion.nombre.toLowerCase().includes(search.toLowerCase()) ||
        estacion.localidad.toLowerCase().includes(search.toLowerCase())
      const matchesDepartamento =
        filterDepartamento === 'all' || estacion.departamento === filterDepartamento
      const matchesMarca =
        filterMarca === 'all' || estacion.marca === filterMarca
      const matchesCliente =
        filterCliente === 'all' ||
        (filterCliente === 'cliente' && estacion.esCliente) ||
        (filterCliente === 'no-cliente' && !estacion.esCliente)
      return matchesSearch && matchesDepartamento && matchesMarca && matchesCliente
    })
  }, [estaciones, search, filterDepartamento, filterMarca, filterCliente])

  const handleCreate = async (data: Omit<Estacion, 'id' | 'creadaEn' | 'actualizadaEn'>) => {
    try {
      await create(data)
      toast.success('Estación creada correctamente')
      refetch()
    } catch {
      toast.error('Error al crear la estación')
    }
  }

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estaciones"
        description={`${estaciones.length} estaciones registradas`}
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar estación
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
            placeholder="Buscar por nombre o localidad..."
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
        <Select value={filterMarca} onValueChange={setFilterMarca}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las marcas</SelectItem>
            {MARCAS.map((marca) => (
              <SelectItem key={marca} value={marca}>
                {marca}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCliente} onValueChange={setFilterCliente}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="cliente">Clientes</SelectItem>
            <SelectItem value="no-cliente">No clientes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {view === 'mapa' ? (
        <EstacionesMap estaciones={filteredEstaciones} />
      ) : filteredEstaciones.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="Sin estaciones"
          description={
            search || filterDepartamento !== 'all' || filterMarca !== 'all'
              ? 'No se encontraron estaciones con los filtros aplicados'
              : 'Todavía no hay estaciones registradas'
          }
          action={
            !search && filterDepartamento === 'all' && filterMarca === 'all' ? (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar primera estación
              </Button>
            ) : undefined
          }
        />
      ) : (
        <EstacionTable estaciones={filteredEstaciones} />
      )}

      <EstacionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        loading={mutationLoading}
      />
    </div>
  )
}
