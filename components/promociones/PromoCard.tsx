'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Tag } from 'lucide-react'
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
      <div className="relative aspect-[16/9] bg-slate-100">
        <Image
          src={promocion.flyerUrl || '/assets/promocion.png'}
          alt={promocion.nombre}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader className="p-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium line-clamp-1">
            {promocion.nombre}
          </CardTitle>
          <Badge className={`${estadoBadgeStyles[promocion.estado]} text-xs px-1.5 py-0`}>
            {estadoLabels[promocion.estado]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1 space-y-1.5">
        {(promocion.producto || promocion.precio != null) && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <Tag className="h-3 w-3 text-blue-500" />
            {promocion.producto && <span>{promocion.producto}</span>}
            {promocion.precio != null && (
              <span className="ml-auto text-green-700">${promocion.precio}</span>
            )}
          </div>
        )}
        {(promocion.vigenciaDesde || promocion.vigenciaHasta) ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3 w-3" />
            <span>
              {promocion.vigenciaDesde
                ? format(promocion.vigenciaDesde, 'dd/MM', { locale: es })
                : '?'}{' '}
              -{' '}
              {promocion.vigenciaHasta
                ? format(promocion.vigenciaHasta, 'dd/MM/yy', { locale: es })
                : 'sin vencimiento'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3 w-3" />
            <span>Hasta agotar stock</span>
          </div>
        )}
        <div className="pt-1">
          <Button asChild variant="outline" size="sm" className="w-full h-7 text-xs">
            <Link href={`/promociones/${promocion.id}`}>Ver detalle</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
