const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

export async function uploadFlyer(
  _promocionId: string,
  file: File
): Promise<{ url: string; path: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'flyers')

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Error al subir imagen a Cloudinary')
  }

  const data = await res.json()
  return { url: data.secure_url, path: data.public_id }
}

export async function deleteFlyer(publicId: string): Promise<void> {
  // La eliminación desde el cliente requiere firma — se ignora silenciosamente.
  // Para borrar, hacerlo desde la consola de Cloudinary o agregar una API route con el secret.
  console.warn('deleteFlyer: eliminación no implementada para Cloudinary client-side', publicId)
}

export async function getFlyerUrl(publicId: string): Promise<string> {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`
}
