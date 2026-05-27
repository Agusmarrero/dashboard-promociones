export type Marca = 'ANCAP' | 'AXION' | 'DISA' | 'OTRA'
export type FuenteEstacion = 'URSEA' | 'MANUAL'
export type EstadoPromocion = 'borrador' | 'activa' | 'vencida'
export type EstadoEnvio = 'enviado' | 'error'

export interface Estacion {
  id: string
  nombre: string
  marca: Marca
  departamento: string
  localidad: string
  direccion: string
  telefono?: string
  latitud?: number
  longitud?: number
  fuente: FuenteEstacion
  esCliente: boolean
  clienteId?: string | null
  creadaEn: Date
  actualizadaEn: Date
}

export interface Cliente {
  id: string
  estacionId: string | null
  estacionNombre: string
  nombreContacto: string
  telefonoWhatsapp: string
  email?: string
  activo: boolean
  notas?: string
  codigoExterno?: string
  direccion?: string
  localidad?: string
  departamento?: string
  creadoEn: Date
}

export interface Promocion {
  id: string
  nombre: string
  descripcion: string
  producto?: string
  precio?: number
  flyerUrl: string
  flyerPath: string
  vigenciaDesde?: Date
  vigenciaHasta?: Date
  estado: EstadoPromocion
  creadaEn: Date
}

export interface Envio {
  id: string
  promocionId: string
  promocionNombre: string
  fecha: Date
  destinatarios: DestinatarioEnvio[]
  totalEnviados: number
  totalErrores: number
  creadoPor: string
}

export interface DestinatarioEnvio {
  clienteId: string
  clienteNombre: string
  telefono: string
  estado: EstadoEnvio
  whatsappMsgId?: string
  error?: string
}
