'use client'

import Link from 'next/link'
import { Store } from 'lucide-react'
import type { Comercio } from '@/types'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ComercioTableProps {
  comercios: Comercio[]
}

export function ComercioTable({ comercios }: ComercioTableProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Localidad</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comercios.map((comercio) => (
            <TableRow key={comercio.id} className="cursor-pointer hover:bg-slate-50">
              <TableCell>
                <Link
                  href={`/comercios/${comercio.id}`}
                  className="flex items-center gap-2 font-medium text-slate-900 hover:text-blue-600"
                >
                  <Store className="h-4 w-4 text-slate-400" />
                  {comercio.nombre}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{comercio.tipo}</Badge>
              </TableCell>
              <TableCell className="text-slate-600">
                {comercio.nombreContacto}
              </TableCell>
              <TableCell className="text-slate-600">
                {comercio.departamento || '-'}
              </TableCell>
              <TableCell className="text-slate-600">
                {comercio.localidad || '-'}
              </TableCell>
              <TableCell>
                {comercio.activo ? (
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
