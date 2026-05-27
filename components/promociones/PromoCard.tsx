'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar } from 'lucide-react'
import type { Promocion } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface PromoCardProps {
  promocion: Promocion
}

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

export function PromoCard({ promocion }: PromoCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {promocion.flyerUrl && (
        <div className="relative aspect-[4/3] bg-slate-100">
          <Image
            src={promocion.flyerUrl}
            alt={promocion.nombre}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-medium line-clamp-2">
            {promocion.nombre}
          </CardTitle>
          <Badge className={estadoBadgeStyles[promocion.estado]}>
            {estadoLabels[promocion.estado]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600 line-clamp-2">
          {promocion.descripcion}
        </p>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar className="h-4 w-4" />
          <span>
            {format(promocion.vigenciaDesde, 'dd/MM', { locale: es })} -{' '}
            {format(promocion.vigenciaHasta, 'dd/MM/yyyy', { locale: es })}
          </span>
        </div>
        <div className="pt-2">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/promociones/${promocion.id}`}>Ver detalle</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
