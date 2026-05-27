'use client'

import { BarChart2 } from 'lucide-react'
import { PageHeader } from '@/components/shared'
import { Card, CardContent } from '@/components/ui/card'

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Visualización de métricas y estadísticas"
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-slate-100 p-4 mb-4">
            <BarChart2 className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Próximamente
          </h3>
          <p className="text-sm text-slate-500 text-center max-w-md">
            Los reportes con Power BI Embedded estarán disponibles en la fase 2
            del proyecto. Podrás visualizar métricas detalladas de envíos,
            clientes y promociones.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
