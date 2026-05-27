'use client'

import { useState, useMemo } from 'react'
import { Send, Check, AlertCircle, Loader2 } from 'lucide-react'
import type { Promocion, Cliente, DestinatarioEnvio } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEPARTAMENTOS } from '@/constants/departamentos'
import { createEnvio } from '@/lib/firebase/envios'
import { toast } from 'sonner'

interface EnvioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promocion: Promocion
  clientes: Cliente[]
  onComplete?: () => void
}

type EnvioStatus = 'idle' | 'sending' | 'complete'

export function EnvioModal({
  open,
  onOpenChange,
  promocion,
  clientes,
  onComplete,
}: EnvioModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filterDepartamento, setFilterDepartamento] = useState<string>('all')
  const [mensaje, setMensaje] = useState(
    `¡Hola! Te compartimos nuestra nueva promoción: ${promocion.nombre}\n\n${promocion.descripcion}`
  )
  const [status, setStatus] = useState<EnvioStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<DestinatarioEnvio[]>([])

  const filteredClientes = useMemo(() => {
    if (filterDepartamento === 'all') return clientes
    return clientes.filter((c) => {
      const estacionDep = c.estacionNombre
      return estacionDep.includes(filterDepartamento)
    })
  }, [clientes, filterDepartamento])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredClientes.map((c) => c.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleToggle = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const handleSend = async () => {
    const selectedClientes = clientes.filter((c) => selectedIds.has(c.id))
    if (selectedClientes.length === 0) return

    setStatus('sending')
    setProgress(0)
    setResults([])

    const destinatarios: DestinatarioEnvio[] = []
    let enviados = 0
    let errores = 0

    for (let i = 0; i < selectedClientes.length; i++) {
      const cliente = selectedClientes[i]

      try {
        const response = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telefono: cliente.telefonoWhatsapp,
            mensaje,
            flyerUrl: promocion.flyerUrl,
          }),
        })

        const data = await response.json()

        if (data.success) {
          destinatarios.push({
            clienteId: cliente.id,
            clienteNombre: cliente.nombreContacto,
            telefono: cliente.telefonoWhatsapp,
            estado: 'enviado',
            whatsappMsgId: data.sid,
          })
          enviados++
        } else {
          destinatarios.push({
            clienteId: cliente.id,
            clienteNombre: cliente.nombreContacto,
            telefono: cliente.telefonoWhatsapp,
            estado: 'error',
            error: data.error,
          })
          errores++
        }
      } catch (error) {
        destinatarios.push({
          clienteId: cliente.id,
          clienteNombre: cliente.nombreContacto,
          telefono: cliente.telefonoWhatsapp,
          estado: 'error',
          error: error instanceof Error ? error.message : 'Error desconocido',
        })
        errores++
      }

      setProgress(((i + 1) / selectedClientes.length) * 100)
      setResults([...destinatarios])
    }

    await createEnvio({
      promocionId: promocion.id,
      promocionNombre: promocion.nombre,
      destinatarios,
      totalEnviados: enviados,
      totalErrores: errores,
      creadoPor: 'admin',
    })

    setStatus('complete')

    if (errores === 0) {
      toast.success(`${enviados} mensajes enviados correctamente`)
    } else {
      toast.warning(`${enviados} enviados, ${errores} con errores`)
    }

    onComplete?.()
  }

  const handleClose = () => {
    if (status === 'sending') return
    setStatus('idle')
    setProgress(0)
    setResults([])
    setSelectedIds(new Set())
    onOpenChange(false)
  }

  const allSelected =
    filteredClientes.length > 0 &&
    filteredClientes.every((c) => selectedIds.has(c.id))

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar promoción por WhatsApp</DialogTitle>
        </DialogHeader>

        {status === 'idle' && (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Mensaje a enviar</Label>
                <Textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Seleccionar destinatarios</Label>
                  <Select
                    value={filterDepartamento}
                    onValueChange={setFilterDepartamento}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filtrar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {DEPARTAMENTOS.map((dep) => (
                        <SelectItem key={dep} value={dep}>
                          {dep}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 py-2 border-b">
                  <Checkbox
                    id="select-all"
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="font-medium">
                    Seleccionar todos ({filteredClientes.length})
                  </Label>
                </div>

                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {filteredClientes.map((cliente) => (
                      <div
                        key={cliente.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={cliente.id}
                          checked={selectedIds.has(cliente.id)}
                          onCheckedChange={() => handleToggle(cliente.id)}
                        />
                        <Label htmlFor={cliente.id} className="font-normal">
                          {cliente.nombreContacto} - {cliente.estacionNombre}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleSend}
                disabled={selectedIds.size === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar a {selectedIds.size} destinatarios
              </Button>
            </DialogFooter>
          </>
        )}

        {status === 'sending' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <p className="font-medium">Enviando mensajes...</p>
            </div>
            <Progress value={progress} />
            <p className="text-sm text-slate-500 text-center">
              {Math.round(progress)}% completado
            </p>
          </div>
        )}

        {status === 'complete' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <p className="font-medium">Envío completado</p>
            </div>

            <div className="flex gap-4">
              <Badge className="bg-green-100 text-green-700">
                {results.filter((r) => r.estado === 'enviado').length} enviados
              </Badge>
              {results.filter((r) => r.estado === 'error').length > 0 && (
                <Badge className="bg-red-100 text-red-700">
                  {results.filter((r) => r.estado === 'error').length} errores
                </Badge>
              )}
            </div>

            {results.filter((r) => r.estado === 'error').length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-600">
                  Errores en envío:
                </p>
                <ScrollArea className="h-32">
                  {results
                    .filter((r) => r.estado === 'error')
                    .map((r) => (
                      <div
                        key={r.clienteId}
                        className="flex items-start gap-2 text-sm py-1"
                      >
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <span>
                          {r.clienteNombre}: {r.error}
                        </span>
                      </div>
                    ))}
                </ScrollArea>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleClose}>Cerrar</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
