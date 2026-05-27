'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { usePromocionMutations } from '@/hooks'
import { uploadFlyer } from '@/lib/storage'
import { PageHeader } from '@/components/shared'
import { PromoForm } from '@/components/promociones'
import { Button } from '@/components/ui/button'
import type { Promocion } from '@/types'
import { toast } from 'sonner'
import { useState } from 'react'

export default function NuevaPromocionPage() {
  const router = useRouter()
  const { create } = usePromocionMutations()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (
    data: Omit<Promocion, 'id' | 'creadaEn'>,
    flyerFile?: File
  ) => {
    try {
      setLoading(true)

      let flyerUrl = data.flyerUrl
      let flyerPath = data.flyerPath

      if (flyerFile) {
        const tempId = `temp_${Date.now()}`
        const uploaded = await uploadFlyer(tempId, flyerFile)
        flyerUrl = uploaded.url
        flyerPath = uploaded.path
      }

      const id = await create({
        ...data,
        flyerUrl,
        flyerPath,
      })

      toast.success('Promoción creada correctamente')
      router.push(`/promociones/${id}`)
    } catch {
      toast.error('Error al crear la promoción')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/promociones">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title="Nueva promoción"
          description="Creá una nueva promoción para enviar a tus clientes"
        />
      </div>

      <PromoForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
