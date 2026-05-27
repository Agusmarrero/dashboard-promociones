'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Cliente } from '@/types'
import {
  getClientes,
  getClientesActivos,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
} from '@/lib/firebase/clientes'

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getClientes()
      setClientes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  return { clientes, loading, error, refetch: fetchClientes }
}

export function useClientesActivos() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getClientesActivos()
      setClientes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  return { clientes, loading, error, refetch: fetchClientes }
}

export function useCliente(id: string) {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCliente = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const data = await getClienteById(id)
      setCliente(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cliente')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchCliente()
  }, [fetchCliente])

  return { cliente, loading, error, refetch: fetchCliente }
}

export function useClienteMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (data: Omit<Cliente, 'id' | 'creadoEn'>) => {
    try {
      setLoading(true)
      setError(null)
      const id = await createCliente(data)
      return id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cliente')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const update = async (id: string, data: Partial<Cliente>) => {
    try {
      setLoading(true)
      setError(null)
      await updateCliente(id, data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar cliente')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await deleteCliente(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar cliente')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { create, update, remove, loading, error }
}
