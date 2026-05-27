'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useEstaciones, useClienteMutations } from '@/hooks'
import { marcarComoCliente } from '@/lib/firebase/estaciones'
import { PageHeader, LoadingPage } from '@/components/shared'
import { ClienteForm } from '@/components/clientes'
import { Button } from '@/components/ui/button'
import type { Cliente } from '@/types'
import { toast } from 'sonner'

export default function NuevoClientePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedEstacionId = searchParams.get('estacionId') || undefined
  const { estaciones, loading: loadingEstaciones } = useEstaciones()
  const { create, loading: mutationLoading } = useClienteMutations()

  const handleSubmit = async (data: Omit<Cliente, 'id' | 'creadoEn'>) => {
    try {
      const clienteId = await create(data)
      await marcarComoCliente(data.estacionId, clienteId)
      toast.success('Cliente creado correctamente')
      router.push(`/clientes/${clienteId}`)
    } catch {
      toast.error('Error al crear el cliente')
    }
  }

  if (loadingEstaciones) return <LoadingPage />

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/clientes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title="Nuevo cliente"
          description="Asociá un cliente a una estación de servicio"
        />
      </div>

      <ClienteForm
        estaciones={estaciones}
        onSubmit={handleSubmit}
        preselectedEstacionId={preselectedEstacionId}
        loading={mutationLoading}
      />
    </div>
  )
}
