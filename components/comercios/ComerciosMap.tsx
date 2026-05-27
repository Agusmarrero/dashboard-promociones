'use client'

import { useState } from 'react'
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, Store } from 'lucide-react'
import type { Comercio } from '@/types'
import Link from 'next/link'

interface ComerciosMapProps {
  comercios: Comercio[]
}

const DEFAULT_VIEW = {
  longitude: -56.1645,
  latitude: -32.5228,
  zoom: 6.5,
}

export function ComerciosMap({ comercios }: ComerciosMapProps) {
  const [selected, setSelected] = useState<Comercio | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  const comerciosConCoordenadas = comercios.filter(
    (c) => c.latitud != null && c.longitud != null
  )
  const sinCoordenadas = comercios.length - comerciosConCoordenadas.length

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 border rounded-lg bg-slate-50">
        <MapPin className="h-10 w-10 text-slate-400" />
        <div className="text-center">
          <p className="font-medium text-slate-700">Token de Mapbox no configurado</p>
          <p className="text-sm text-slate-500 mt-1">
            Agregá <code className="bg-slate-100 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> en tu{' '}
            <code className="bg-slate-100 px-1 rounded">.env.local</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-violet-500" />
          Comercio
        </div>
        {sinCoordenadas > 0 && (
          <span className="ml-auto text-xs">
            {sinCoordenadas} comercio{sinCoordenadas !== 1 ? 's' : ''} sin coordenadas (no se muestran)
          </span>
        )}
      </div>

      <div className="rounded-lg overflow-hidden border" style={{ height: 520 }}>
        <Map
          mapboxAccessToken={apiKey}
          initialViewState={DEFAULT_VIEW}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          <NavigationControl position="top-right" />

          {comerciosConCoordenadas.map((comercio) => (
            <Marker
              key={comercio.id}
              longitude={comercio.longitud!}
              latitude={comercio.latitud!}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                setSelected(comercio)
              }}
            >
              <div className="w-5 h-5 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-125 bg-violet-500" />
            </Marker>
          ))}

          {selected && selected.latitud != null && selected.longitud != null && (
            <Popup
              longitude={selected.longitud}
              latitude={selected.latitud}
              anchor="bottom"
              offset={20}
              onClose={() => setSelected(null)}
              closeButton
              closeOnClick={false}
            >
              <div className="p-1 min-w-44 space-y-2 text-slate-900">
                <div className="flex items-start gap-2">
                  <Store className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">{selected.nombre}</p>
                    <p className="text-xs text-slate-500">{selected.tipo}</p>
                  </div>
                </div>
                {(selected.localidad || selected.departamento) && (
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {[selected.localidad, selected.departamento].filter(Boolean).join(', ')}
                  </div>
                )}
                {selected.direccion && (
                  <p className="text-xs text-slate-500">{selected.direccion}</p>
                )}
                <div className="flex items-center justify-end pt-1">
                  <Link
                    href={`/comercios/${selected.id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Ver detalle →
                  </Link>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  )
}
