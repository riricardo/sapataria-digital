import imageCompression from 'browser-image-compression'

const SEND_ORDER_EMAIL_URL =
  'https://sapataria-digital-api-fb596c9604ae.herokuapp.com/api/email/send-order'

const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  initialQuality: 0.85,
}

export interface OrderEmailAttachment {
  filename: string
  contentType: string
  contentBase64: string
}

export interface OrderEmailPayload {
  orderCode: string
  customerName: string
  phone: string
  itemType: string
  subject?: string
  title?: string
  messageTitle?: string
  emailSubject?: string
  emailTitle?: string
  emailBody?: string
  formattedMessage?: string
  serviceDescription?: string
  problemDescription?: string
  imageBase64?: string
  attachments?: OrderEmailAttachment[]
}

export function buildOrderEmailTitles(customerName: string) {
  const subject = `Orçamento para ${customerName}`
  const title = `Nova solicitação de orçamento de ${customerName}`

  return { subject, title }
}

export function buildOrderEmailBody(orderData: {
  orderCode: string
  customerName: string
  phone: string
  itemType: string
  serviceDescription: string
  problemDescription: string
}) {
  return [
    `Nova solicitação de orçamento de ${orderData.customerName}`,
    '',
    'DADOS DO CLIENTE',
    `Nome: ${orderData.customerName}`,
    `WhatsApp: ${orderData.phone}`,
    '',
    'DADOS DO ITEM',
    `Código: ${orderData.orderCode}`,
    `Tipo de item: ${orderData.itemType}`,
    `Serviço desejado: ${orderData.serviceDescription}`,
    '',
    'PROBLEMA RELATADO',
    '-----------------',
    orderData.problemDescription,
  ].join('\n')
}

interface OrderEmailResponse {
  success: boolean
  message?: string
}

function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Erro ao ler imagem'))

    reader.readAsDataURL(file)
  })
}

function sizeInMB(file: Blob): string {
  return (file.size / 1024 / 1024).toFixed(2)
}

function mimeFromDataUrl(dataUrl: string, fallback: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,/)
  return match?.[1] ?? fallback
}

function filenameWithMime(filename: string, contentType: string) {
  const nameWithoutExtension = filename.replace(/\.[^.]+$/, '') || 'imagem'
  const extensionByMime: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
  }
  const extension = extensionByMime[contentType] ?? 'jpg'

  return `${nameWithoutExtension}.${extension}`
}

export async function fileToCompressedAttachment(file: File): Promise<OrderEmailAttachment> {
  try {
    const compressedFile = await imageCompression(file, IMAGE_COMPRESSION_OPTIONS)
    const contentBase64 = await readFileAsDataUrl(compressedFile)
    const contentType = mimeFromDataUrl(
      contentBase64,
      compressedFile.type || file.type || 'image/jpeg',
    )

    console.log('[image-compression]', {
      filename: file.name,
      mimeType: file.type || 'desconhecido',
      originalSizeMB: sizeInMB(file),
      compressedSizeMB: sizeInMB(compressedFile),
    })

    return {
      filename: filenameWithMime(file.name, contentType),
      contentType,
      contentBase64,
    }
  } catch (error) {
    console.error('[image-compression] Falha ao comprimir imagem', {
      filename: file.name,
      mimeType: file.type || 'desconhecido',
      originalSizeMB: sizeInMB(file),
      error,
    })
    throw new Error('Não foi possível preparar a imagem. Tente outra foto ou envie sem imagem.', {
      cause: error,
    })
  }
}

export async function sendOrderEmail(orderData: OrderEmailPayload): Promise<OrderEmailResponse> {
  const response = await fetch(SEND_ORDER_EMAIL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  })
  const data = (await response.json()) as OrderEmailResponse

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Erro ao enviar pedido')
  }

  return data
}
