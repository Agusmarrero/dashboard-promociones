import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
  try {
    const { telefono, mensaje, flyerUrl } = await request.json()

    if (!telefono || !mensaje) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { success: false, error: 'Twilio no está configurado' },
        { status: 500 }
      )
    }

    const client = twilio(accountSid, authToken)

    const message = await client.messages.create({
      from: whatsappFrom,
      to: `whatsapp:${telefono}`,
      body: mensaje,
      mediaUrl: flyerUrl ? [flyerUrl] : undefined,
    })

    return NextResponse.json({ success: true, sid: message.sid })
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
