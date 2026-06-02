'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getEstaciones } from '@/lib/firebase/estaciones'
import { getClientes } from '@/lib/firebase/clientes'
import { getPromociones } from '@/lib/firebase/promociones'
import { getEnvios } from '@/lib/firebase/envios'
import type { Estacion, Cliente, Promocion, Envio } from '@/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Building2, Users, Megaphone, Send } from 'lucide-react'

const MARCA_COLORS: Record<string, string> = {
  ANCAP: '#e63946',
  AXION: '#f4a261',
  DISA: '#2a9d8f',
  OTRA: '#adb5bd',
}

const ESTADO_COLORS: Record<string, string> = {
  activa: '#2a9d8f',
  borrador: '#adb5bd',
  vencida: '#e63946',
}

function StatCard({ title, value, icon: Icon }: { title: string; value: number; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="rounded-full bg-slate-100 p-3">
          <Icon className="h-6 w-6 text-slate-600" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ReportesPage() {
  const [estaciones, setEstaciones] = useState<Estacion[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [envios, setEnvios] = useState<Envio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getEstaciones(), getClientes(), getPromociones(), getEnvios()])
      .then(([e, c, p, en]) => {
        setEstaciones(e)
        setClientes(c)
        setPromociones(p)
        setEnvios(en)
      })
      .finally(() => setLoading(false))
  }, [])

  // Estaciones por marca
  const porMarca = Object.entries(
    estaciones.reduce<Record<string, number>>((acc, e) => {
      acc[e.marca] = (acc[e.marca] ?? 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  // Estaciones por departamento (top 10)
  const porDepartamento = Object.entries(
    estaciones.reduce<Record<string, number>>((acc, e) => {
      acc[e.departamento] = (acc[e.departamento] ?? 0) + 1
      return acc
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }))

  // Promociones por estado
  const porEstado = Object.entries(
    promociones.reduce<Record<string, number>>((acc, p) => {
      acc[p.estado] = (acc[p.estado] ?? 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  // Envíos: total enviados vs errores
  const totalEnviados = envios.reduce((acc, e) => acc + (e.totalEnviados ?? 0), 0)
  const totalErrores = envios.reduce((acc, e) => acc + (e.totalErrores ?? 0), 0)
  const enviosData = [
    { name: 'Enviados', value: totalEnviados },
    { name: 'Errores', value: totalErrores },
  ]

  // Clientes activos vs inactivos
  const clientesActivos = clientes.filter((c) => c.activo).length
  const clientesData = [
    { name: 'Activos', value: clientesActivos },
    { name: 'Inactivos', value: clientes.length - clientesActivos },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reportes" description="Métricas y estadísticas del sistema" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="h-24 animate-pulse bg-slate-100 rounded mt-2" /></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reportes" description="Métricas y estadísticas del sistema" />

      {/* Totales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Estaciones" value={estaciones.length} icon={Building2} />
        <StatCard title="Clientes" value={clientes.length} icon={Users} />
        <StatCard title="Promociones" value={promociones.length} icon={Megaphone} />
        <StatCard title="Envíos" value={envios.length} icon={Send} />
      </div>

      {/* Estaciones por marca y por departamento */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Estaciones por marca</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={porMarca} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {porMarca.map((entry) => (
                    <Cell key={entry.name} fill={MARCA_COLORS[entry.name] ?? '#888'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top 10 departamentos</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={porDepartamento} layout="vertical" margin={{ left: 16 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2a9d8f" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Promociones por estado y Envíos */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Promociones por estado</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={porEstado} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  {porEstado.map((entry) => (
                    <Cell key={entry.name} fill={ESTADO_COLORS[entry.name] ?? '#888'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Envíos WhatsApp</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={enviosData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  <Cell fill="#2a9d8f" />
                  <Cell fill="#e63946" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Clientes</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={clientesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  <Cell fill="#2a9d8f" />
                  <Cell fill="#adb5bd" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
