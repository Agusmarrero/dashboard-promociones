'use client'

import Link from 'next/link'
import { User, Phone, Building2 } from 'lucide-react'
import type { Cliente } from '@/types'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ClienteTableProps {
  clientes: Cliente[]
}

export function ClienteTable({ clientes }: ClienteTableProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contacto</TableHead>
            <TableHead>Estación</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente.id} className="cursor-pointer hover:bg-slate-50">
              <TableCell>
                <Link
                  href={`/clientes/${cliente.id}`}
                  className="flex items-center gap-2 font-medium text-slate-900 hover:text-blue-600"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  {cliente.nombreContacto}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/estaciones/${cliente.estacionId}`}
                  className="flex items-center gap-2 text-slate-600 hover:text-blue-600"
                >
                  <Building2 className="h-4 w-4" />
                  {cliente.estacionNombre}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-4 w-4" />
                  {cliente.telefonoWhatsapp}
                </div>
              </TableCell>
              <TableCell className="text-slate-600">
                {cliente.email || '-'}
              </TableCell>
              <TableCell>
                {cliente.activo ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="secondary">Inactivo</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
