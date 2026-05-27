import { generateText, Output } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const flyerSchema = z.object({
  nombre: z.string().describe('Nombre corto de la promoción'),
  descripcion: z.string().describe('Descripción completa de la promoción'),
  producto: z.string().describe('Producto o servicio promocionado, ej: Nafta Premium, Diesel, Lavado'),
  precio: z.number().nullable().describe('Monto que el cliente debe pagar para acceder, solo el número'),
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('flyer') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No se recibió ninguna imagen' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

  const { output } = await generateText({
    model: anthropic('claude-opus-4.7'),
    output: Output.object({ schema: flyerSchema }),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            image: base64,
            mediaType: mediaType,
          },
          {
            type: 'text',
            text: 'Analizá este flyer de promoción de combustible/estación de servicio y extraé la información solicitada.',
          },
        ],
      },
    ],
  })

  return NextResponse.json(output)
}
