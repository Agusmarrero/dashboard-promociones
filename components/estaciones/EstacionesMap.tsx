'use client'

import { useState, useCallback } from 'react'
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, Building2 } from 'lucide-react'
import type { Estacion } from '@/types'
import Link from 'next/link'

interface EstacionesMapProps {
  estaciones: Estacion[]
}

const DEFAULT_VIEW = {
  longitude: -56.1645,
  latitude: -32.5228,
  zoom: 6.5,
}

export function EstacionesMap({ estaciones }: EstacionesMapProps) {
  const [selected, setSelected] = useState<Estacion | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  const estacionesConCoordenadas = estaciones.filter(
    (e) => e.latitud != null && e.longitud != null
  )
  const sinCoordenadas = estaciones.length - estacionesConCoordenadas.length

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
          <p className="text-xs text-slate-400 mt-2">
            Gratis en{' '}
            <span className="underline">mapbox.com</span> — 50,000 cargas/mes sin costo
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
          Cliente
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-slate-400" />
          No cliente
        </div>
        {sinCoordenadas > 0 && (
          <span className="ml-auto text-xs">
            {sinCoordenadas} estación{sinCoordenadas !== 1 ? 'es' : ''} sin coordenadas (no se muestran)
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

          {estacionesConCoordenadas.map((estacion) => (
            <Marker
              key={estacion.id}
              longitude={estacion.longitud!}
              latitude={estacion.latitud!}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                setSelected(estacion)
              }}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-125 ${
                  estacion.esCliente ? 'bg-blue-500' : 'bg-slate-400'
                }`}
              />
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
                  <Building2 className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">{selected.nombre}</p>
                    <p className="text-xs text-slate-500">{selected.marca}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {selected.localidad}, {selected.departamento}
                </div>
                {selected.direccion && (
                  <p className="text-xs text-slate-500">{selected.direccion}</p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                      selected.esCliente
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {selected.esCliente ? 'Cliente' : 'No cliente'}
                  </span>
                  <Link
                    href={`/estaciones/${selected.id}`}
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
