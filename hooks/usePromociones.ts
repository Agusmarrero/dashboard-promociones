'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Promocion, EstadoPromocion } from '@/types'
import {
  getPromociones,
  getPromocionesActivas,
  getPromocionById,
  createPromocion,
  updatePromocion,
  deletePromocion,
  updateEstadoPromocion,
} from '@/lib/firebase/promociones'

export function usePromociones() {
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPromociones = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPromociones()
      setPromociones(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar promociones')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPromociones()
  }, [fetchPromociones])

  return { promociones, loading, error, refetch: fetchPromociones }
}

export function usePromocionesActivas() {
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPromociones = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPromocionesActivas()
      setPromociones(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar promociones')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPromociones()
  }, [fetchPromociones])

  return { promociones, loading, error, refetch: fetchPromociones }
}

export function usePromocion(id: string) {
  const [promocion, setPromocion] = useState<Promocion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPromocion = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const data = await getPromocionById(id)
      setPromocion(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar promoción')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPromocion()
  }, [fetchPromocion])

  return { promocion, loading, error, refetch: fetchPromocion }
}

export function usePromocionMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (data: Omit<Promocion, 'id' | 'creadaEn'>) => {
    try {
      setLoading(true)
      setError(null)
      const id = await createPromocion(data)
      return id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear promoción')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const update = async (id: string, data: Partial<Promocion>) => {
    try {
      setLoading(true)
      setError(null)
      await updatePromocion(id, data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar promoción')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await deletePromocion(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar promoción')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateEstado = async (id: string, estado: EstadoPromocion) => {
    try {
      setLoading(true)
      setError(null)
      await updateEstadoPromocion(id, estado)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { create, update, remove, updateEstado, loading, error }
}
