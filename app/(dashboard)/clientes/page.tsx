'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, Users } from 'lucide-react'
import { useClientes } from '@/hooks'
import { PageHeader, EmptyState, LoadingPage } from '@/components/shared'
import { ClienteTable } from '@/components/clientes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ClientesPage() {
  const { clientes, loading } = useClientes()
  const [search, setSearch] = useState('')
  const [filterActivo, setFilterActivo] = useState<string>('all')

  const filteredClientes = useMemo(() => {
    return clientes.filter((cliente) => {
      const matchesSearch =
        cliente.nombreContacto.toLowerCase().includes(search.toLowerCase()) ||
        cliente.estacionNombre.toLowerCase().includes(search.toLowerCase()) ||
        cliente.telefonoWhatsapp.includes(search)
      const matchesActivo =
        filterActivo === 'all' ||
        (filterActivo === 'activo' && cliente.activo) ||
        (filterActivo === 'inactivo' && !cliente.activo)
      return matchesSearch && matchesActivo
    })
  }, [clientes, search, filterActivo])

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description={`${clientes.length} clientes registrados`}
        action={
          <Button asChild>
            <Link href="/clientes/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo cliente
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre, estación o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterActivo} onValueChange={setFilterActivo}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="activo">Activos</SelectItem>
            <SelectItem value="inactivo">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredClientes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin clientes"
          description={
            search || filterActivo !== 'all'
              ? 'No se encontraron clientes con los filtros aplicados'
              : 'Todavía no hay clientes registrados'
          }
          action={
            !search && filterActivo === 'all' ? (
              <Button asChild>
                <Link href="/clientes/nuevo">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar primer cliente
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ClienteTable clientes={filteredClientes} />
      )}
    </div>
  )
}
