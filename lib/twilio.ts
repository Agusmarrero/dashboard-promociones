import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'

export async function sendWhatsAppMessage(
  telefono: string,
  mensaje: string,
  flyerUrl?: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!accountSid || !authToken) {
    return { success: false, error: 'Twilio credentials not configured' }
  }

  const client = twilio(accountSid, authToken)

  try {
    const message = await client.messages.create({
      from: whatsappFrom,
      to: `whatsapp:${telefono}`,
      body: mensaje,
      mediaUrl: flyerUrl ? [flyerUrl] : undefined,
    })

    return { success: true, sid: message.sid }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}
