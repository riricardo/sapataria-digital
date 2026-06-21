import imageCompression from 'browser-image-compression'

const SEND_ORDER_EMAIL_URL =
  'https://sapataria-digital-api-fb596c9604ae.herokuapp.com/api/email/send'

const ATTACHMENT_IMAGE_TYPE = 'image/jpeg'
const ATTACHMENT_IMAGE_EXTENSION = 'jpg'
const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  initialQuality: 0.85,
  fileType: ATTACHMENT_IMAGE_TYPE,
}

export interface OrderEmailAttachment {
  filename: string
  contentType: string
  contentBase64: string
}

export interface CompressedOrderImage {
  attachment: OrderEmailAttachment
  originalSizeMB: string
  optimizedSizeMB: string
  reductionPercent: number
}

export interface OrderEmailHtmlOrder {
  orderCode: string
  customerName: string
  phone: string
  itemType: string
  serviceDescription?: string
  problemDescription?: string
}

export interface OrderEmailPayload extends OrderEmailHtmlOrder {
  subject?: string
  title?: string
  messageTitle?: string
  emailSubject?: string
  emailTitle?: string
  emailBody?: string
  formattedMessage?: string
  imageBase64?: string
  attachments?: OrderEmailAttachment[]
}

interface OrderEmailApiPayload {
  subject: string
  html: string
  text: string
  attachments: OrderEmailAttachment[]
}

interface OrderEmailResponse {
  success: boolean
  message?: string
}

export function buildOrderEmailTitles(customerName: string) {
  const subject = `Solicitação de ${customerName}`
  const title = `Nova solicitação de ${customerName}`

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
    `Nova solicitação de ${orderData.customerName}`,
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

export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

function formatOrderCodeForWhatsApp(orderCode: string) {
  return orderCode.replace(/[-_./]/g, ' ')
}

function buildWhatsAppUrl(order: OrderEmailHtmlOrder) {
  const { orderCode, phone, itemType, serviceDescription } = order
  const digits = onlyDigits(phone)
  if (!digits) {
    return ''
  }

  const phoneWithCountryCode = digits.startsWith('55') ? digits : `55${digits}`
  const readableOrderCode = formatOrderCodeForWhatsApp(orderCode)
  const message = encodeURIComponent([
    `Olá! Aqui é da Sapataria Bebedouro.`,
    `Estou entrando em contato sobre a solicitação ${readableOrderCode}.`,
    `Item: ${itemType}.`,
    `Serviço: ${serviceDescription || 'Não informado'}.`,
    '',
    'Valor estimado do reparo: R$ ',
  ].join('\n'))
  return `https://wa.me/${phoneWithCountryCode}?text=${message}`
}

export function buildOrderEmailHtml(order: OrderEmailHtmlOrder) {
  const {
    orderCode,
    customerName,
    phone,
    itemType,
    serviceDescription,
    problemDescription,
  } = order
  const phoneUrl = buildWhatsAppUrl(order)
  const escapedPhone = escapeHtml(phone)
  const phoneContent = phoneUrl
    ? `<a href="${escapeHtml(phoneUrl)}" style="display: inline-block; background: #0f5c2e; color: #fff; padding: 8px 12px; border-radius: 4px; font-weight: bold; text-decoration: none;">Abrir WhatsApp: ${escapedPhone}</a>`
    : `<strong style="color: #0f5c2e;">${escapedPhone}</strong>`

  return `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">
      <h1 style="margin: 0 0 16px; color: #7a3f18;">Novo pedido - Sapataria Bebedouro</h1>

      <p style="font-size: 18px; margin: 0 0 24px;">
        Ordem:
        <strong style="background: #7a3f18; color: #fff; padding: 6px 10px; border-radius: 4px;">
          ${escapeHtml(orderCode)}
        </strong>
      </p>

      <table cellpadding="10" cellspacing="0" style="width: 100%; max-width: 720px; border-collapse: collapse; border: 1px solid #ddd;">
        <tr>
          <td style="font-weight: bold; width: 190px; border: 1px solid #ddd; background: #f7f3ef;">Cliente</td>
          <td style="border: 1px solid #ddd;">${escapeHtml(customerName)}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; border: 1px solid #ddd; background: #f7f3ef;">Telefone</td>
          <td style="border: 1px solid #ddd;">${phoneContent}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; border: 1px solid #ddd; background: #f7f3ef;">Tipo do item</td>
          <td style="border: 1px solid #ddd;">
            <strong>${escapeHtml(itemType)}</strong>
          </td>
        </tr>
        <tr>
          <td style="font-weight: bold; border: 1px solid #ddd; background: #f7f3ef;">Serviço solicitado</td>
          <td style="border: 1px solid #ddd;">
            <strong>${escapeHtml(serviceDescription || 'Não informado')}</strong>
          </td>
        </tr>
      </table>

      <section style="width: 100%; max-width: 720px; margin-top: 22px;">
        <h2 style="margin: 0 0 8px; color: #7a3f18; font-size: 18px;">Problema relatado</h2>
        <div style="border: 1px solid #ddd; background: #fff; padding: 14px 16px; white-space: pre-line;">
          ${escapeHtml(problemDescription || 'Não informado')}
        </div>
      </section>
    </div>
  `
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

function attachmentFilename(filename: string) {
  const nameWithoutExtension = filename.replace(/\.[^.]+$/, '') || 'imagem'
  return `${nameWithoutExtension}.${ATTACHMENT_IMAGE_EXTENSION}`
}

function buildOrderAttachments(orderData: OrderEmailPayload): OrderEmailAttachment[] {
  if (orderData.attachments?.length) {
    return orderData.attachments
  }

  if (!orderData.imageBase64) {
    return []
  }

  return [
    {
      filename: `${orderData.orderCode}.jpg`,
      contentType: 'image/jpeg',
      contentBase64: orderData.imageBase64,
    },
  ]
}

function buildOrderEmailApiPayload(orderData: OrderEmailPayload): OrderEmailApiPayload {
  const html = buildOrderEmailHtml({
    orderCode: orderData.orderCode,
    customerName: orderData.customerName,
    phone: orderData.phone,
    itemType: orderData.itemType,
    serviceDescription: orderData.serviceDescription,
    problemDescription: orderData.problemDescription,
  })

  return {
    subject: `Solicitação de ${orderData.customerName}`,
    html,
    text: `Solicitação de ${orderData.customerName}. Ordem: ${orderData.orderCode}. Telefone: ${orderData.phone}.`,
    attachments: buildOrderAttachments(orderData),
  }
}

export async function fileToCompressedAttachment(file: File): Promise<OrderEmailAttachment> {
  const compressedImage = await fileToCompressedImage(file)
  return compressedImage.attachment
}

export async function fileToCompressedImage(file: File): Promise<CompressedOrderImage> {
  try {
    const compressedFile = await imageCompression(file, IMAGE_COMPRESSION_OPTIONS)
    const contentBase64 = await readFileAsDataUrl(compressedFile)
    const contentType = mimeFromDataUrl(contentBase64, ATTACHMENT_IMAGE_TYPE)
    const originalSizeMB = sizeInMB(file)
    const optimizedSizeMB = sizeInMB(compressedFile)
    const reductionPercent = file.size
      ? Math.max(0, Math.round(((file.size - compressedFile.size) / file.size) * 100))
      : 0

    console.log('[image-compression]', {
      filename: file.name,
      mimeType: file.type || 'desconhecido',
      originalSizeMB,
      compressedSizeMB: optimizedSizeMB,
      outputMimeType: contentType,
      reductionPercent,
    })

    return {
      attachment: {
        filename: contentType === ATTACHMENT_IMAGE_TYPE
          ? attachmentFilename(file.name)
          : filenameWithMime(file.name, contentType),
        contentType: contentType || ATTACHMENT_IMAGE_TYPE,
        contentBase64,
      },
      originalSizeMB,
      optimizedSizeMB,
      reductionPercent,
    }
  } catch (error) {
    console.error('[image-compression] Falha ao comprimir imagem', {
      filename: file.name,
      mimeType: file.type || 'desconhecido',
      originalSizeMB: sizeInMB(file),
      error,
    })
    throw new Error('Não foi possível preparar a imagem. Tente outra foto.', {
      cause: error,
    })
  }
}

export async function sendOrderEmail(orderData: OrderEmailPayload): Promise<OrderEmailResponse> {
  const payload = buildOrderEmailApiPayload(orderData)
  const response = await fetch(SEND_ORDER_EMAIL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const data = (await response.json().catch(() => ({
    success: response.ok,
  }))) as OrderEmailResponse

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Erro ao enviar pedido')
  }

  return data
}
