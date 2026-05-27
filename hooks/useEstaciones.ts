'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Estacion } from '@/types'
import {
  getEstaciones,
  getEstacionById,
  createEstacion,
  updateEstacion,
  deleteEstacion,
} from '@/lib/firebase/estaciones'

export function useEstaciones() {
  const [estaciones, setEstaciones] = useState<Estacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEstaciones = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getEstaciones()
      setEstaciones(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estaciones')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEstaciones()
  }, [fetchEstaciones])

  return { estaciones, loading, error, refetch: fetchEstaciones }
}

export function useEstacion(id: string) {
  const [estacion, setEstacion] = useState<Estacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEstacion = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const data = await getEstacionById(id)
      setEstacion(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estación')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchEstacion()
  }, [fetchEstacion])

  return { estacion, loading, error, refetch: fetchEstacion }
}

export function useEstacionMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (data: Omit<Estacion, 'id' | 'creadaEn' | 'actualizadaEn'>) => {
    try {
      setLoading(true)
      setError(null)
      const id = await createEstacion(data)
      return id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear estación')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const update = async (id: string, data: Partial<Estacion>) => {
    try {
      setLoading(true)
      setError(null)
      await updateEstacion(id, data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estación')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await deleteEstacion(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar estación')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { create, update, remove, loading, error }
}
