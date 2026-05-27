'use client'

import Link from 'next/link'
import { MapPin } from 'lucide-react'
import type { Estacion } from '@/types'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface EstacionTableProps {
  estaciones: Estacion[]
}

export function EstacionTable({ estaciones }: EstacionTableProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Localidad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fuente</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {estaciones.map((estacion) => (
            <TableRow key={estacion.id} className="cursor-pointer hover:bg-slate-50">
              <TableCell>
                <Link
                  href={`/estaciones/${estacion.id}`}
                  className="flex items-center gap-2 font-medium text-slate-900 hover:text-blue-600"
                >
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {estacion.nombre}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{estacion.marca}</Badge>
              </TableCell>
              <TableCell className="text-slate-600">
                {estacion.departamento}
              </TableCell>
              <TableCell className="text-slate-600">
                {estacion.localidad}
              </TableCell>
              <TableCell>
                {estacion.esCliente ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    Cliente
                  </Badge>
                ) : (
                  <Badge variant="secondary">No cliente</Badge>
                )}
              </TableCell>
              <TableCell>
                {estacion.fuente === 'MANUAL' ? (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    Manual
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-500">
                    URSEA
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
