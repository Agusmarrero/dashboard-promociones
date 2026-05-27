'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Building2 } from 'lucide-react'
import type { Estacion } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface EstacionCardProps {
  estacion: Estacion
}

export function EstacionCard({ estacion }: EstacionCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-32 bg-slate-100">
        <Image src="/assets/estacion.png" alt="Estación" fill className="object-cover opacity-80" />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-medium">
            {estacion.nombre}
          </CardTitle>
          <Badge variant="outline">{estacion.marca}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4" />
          <span>
            {estacion.localidad}, {estacion.departamento}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Building2 className="h-4 w-4" />
          <span>{estacion.direccion}</span>
        </div>
        {estacion.telefono && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="h-4 w-4" />
            <span>{estacion.telefono}</span>
          </div>
        )}
        <div className="flex items-center gap-2 pt-2">
          {estacion.esCliente ? (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              Cliente
            </Badge>
          ) : (
            <Badge variant="secondary">No cliente</Badge>
          )}
          {estacion.fuente === 'MANUAL' && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              Manual
            </Badge>
          )}
        </div>
        <div className="pt-2">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/estaciones/${estacion.id}`}>Ver detalle</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
