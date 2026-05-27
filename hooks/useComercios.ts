'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Comercio } from '@/types'
import {
  getComercios,
  getComerciosActivos,
  getComercioById,
  createComercio,
  updateComercio,
  deleteComercio,
} from '@/lib/firebase/comercios'

export function useComercios() {
  const [comercios, setComercios] = useState<Comercio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComercios = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getComercios()
      setComercios(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar comercios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchComercios()
  }, [fetchComercios])

  return { comercios, loading, error, refetch: fetchComercios }
}

export function useComerciosActivos() {
  const [comercios, setComercios] = useState<Comercio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComercios = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getComerciosActivos()
      setComercios(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar comercios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchComercios()
  }, [fetchComercios])

  return { comercios, loading, error, refetch: fetchComercios }
}

export function useComercio(id: string) {
  const [comercio, setComercio] = useState<Comercio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComercio = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const data = await getComercioById(id)
      setComercio(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar comercio')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchComercio()
  }, [fetchComercio])

  return { comercio, loading, error, refetch: fetchComercio }
}

export function useComercioMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (data: Omit<Comercio, 'id' | 'creadoEn'>) => {
    try {
      setLoading(true)
      setError(null)
      const id = await createComercio(data)
      return id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear comercio')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const update = async (id: string, data: Partial<Comercio>) => {
    try {
      setLoading(true)
      setError(null)
      await updateComercio(id, data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar comercio')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await deleteComercio(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar comercio')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { create, update, remove, loading, error }
}
