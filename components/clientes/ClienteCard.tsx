'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, Building2 } from 'lucide-react'
import type { Cliente } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ClienteCardProps {
  cliente: Cliente
}

export function ClienteCard({ cliente }: ClienteCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-24 bg-slate-100">
        <Image src="/assets/cliente.png" alt="Cliente" fill className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-medium">
            {cliente.nombreContacto}
          </CardTitle>
          {cliente.activo ? (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              Activo
            </Badge>
          ) : (
            <Badge variant="secondary">Inactivo</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Building2 className="h-4 w-4" />
          <Link
            href={`/estaciones/${cliente.estacionId}`}
            className="hover:text-blue-600"
          >
            {cliente.estacionNombre}
          </Link>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Phone className="h-4 w-4" />
          <span>{cliente.telefonoWhatsapp}</span>
        </div>
        {cliente.email && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="h-4 w-4" />
            <span>{cliente.email}</span>
          </div>
        )}
        <div className="pt-2">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/clientes/${cliente.id}`}>Ver detalle</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
