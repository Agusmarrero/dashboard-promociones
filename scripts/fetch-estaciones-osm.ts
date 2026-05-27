/**
 * Descarga estaciones de servicio de Uruguay desde OpenStreetMap (Overpass API)
 * y genera un JSON listo para el seed de Firestore.
 *
 * Uso: npx tsx scripts/fetch-estaciones-osm.ts
 * Output: scripts/estaciones-uruguay.json
 */

import fs from 'fs'
import path from 'path'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

// Query: todas las estaciones de combustible (amenity=fuel) en Uruguay
const QUERY = `
[out:json][timeout:60];
area["ISO3166-1"="UY"]->.uy;
(
  node["amenity"="fuel"](area.uy);
  way["amenity"="fuel"](area.uy);
  relation["amenity"="fuel"](area.uy);
);
out center tags;
`

type OSMElement = {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

type EstacionSeed = {
  nombre: string
  marca: 'ANCAP' | 'AXION' | 'DISA' | 'OTRA'
  departamento: string
  localidad: string
  direccion: string
  telefono?: string
  latitud?: number
  longitud?: number
  fuente: 'URSEA'
  esCliente: boolean
}

function detectarMarca(tags: Record<string, string>): EstacionSeed['marca'] {
  const brand = (tags.brand || tags.name || tags.operator || '').toUpperCase()
  if (brand.includes('ANCAP')) return 'ANCAP'
  if (brand.includes('AXION') || brand.includes('ESSO')) return 'AXION'
  if (brand.includes('DISA')) return 'DISA'
  return 'OTRA'
}

function detectarDepartamento(tags: Record<string, string>): string {
  return (
    tags['addr:state'] ||
    tags['addr:province'] ||
    tags['is_in:state'] ||
    ''
  )
}

function detectarLocalidad(tags: Record<string, string>): string {
  return (
    tags['addr:city'] ||
    tags['addr:town'] ||
    tags['addr:village'] ||
    tags['is_in:city'] ||
    ''
  )
}

function detectarDireccion(tags: Record<string, string>): string {
  const parts = [
    tags['addr:street'],
    tags['addr:housenumber'],
  ].filter(Boolean)
  return parts.join(' ') || tags['addr:full'] || ''
}

async function main() {
  console.log('Consultando Overpass API...')

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': 'dashboard-promociones/1.0 (seed script)',
      'Accept': 'application/json',
    },
    body: `data=${encodeURIComponent(QUERY)}`,
  })

  if (!res.ok) throw new Error(`Overpass error: ${res.status}`)

  const data = await res.json() as { elements: OSMElement[] }
  console.log(`Total elementos OSM: ${data.elements.length}`)

  const estaciones: EstacionSeed[] = data.elements
    .filter((el) => {
      const lat = el.lat ?? el.center?.lat
      const lon = el.lon ?? el.center?.lon
      return lat !== undefined && lon !== undefined
    })
    .map((el) => {
      const tags = el.tags || {}
      const lat = el.lat ?? el.center?.lat
      const lon = el.lon ?? el.center?.lon

      return {
        nombre: tags.name || tags.brand || tags.operator || 'Estación sin nombre',
        marca: detectarMarca(tags),
        departamento: detectarDepartamento(tags),
        localidad: detectarLocalidad(tags),
        direccion: detectarDireccion(tags),
        telefono: tags.phone || tags['contact:phone'] || undefined,
        latitud: lat,
        longitud: lon,
        fuente: 'URSEA' as const,
        esCliente: false,
      }
    })

  const outputPath = path.join(process.cwd(), 'scripts', 'estaciones-uruguay.json')
  fs.writeFileSync(outputPath, JSON.stringify(estaciones, null, 2))

  console.log(`\n✓ ${estaciones.length} estaciones guardadas en scripts/estaciones-uruguay.json`)
  console.log('\nResumen por marca:')
  const porMarca = estaciones.reduce((acc, e) => {
    acc[e.marca] = (acc[e.marca] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  console.table(porMarca)
}

main().catch(console.error)
