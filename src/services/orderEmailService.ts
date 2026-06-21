const SEND_ORDER_EMAIL_URL =
  'https://sapataria-digital-api-fb596c9604ae.herokuapp.com/api/email/send'

// @ts-ignore
import pica from 'pica'

const ATTACHMENT_IMAGE_TYPE = 'image/jpeg'
const ATTACHMENT_MAX_DIMENSION = 1280

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

function buildWhatsAppUrl(phone: string) {
  const digits = onlyDigits(phone)
  if (!digits) {
    return ''
  }

  const phoneWithCountryCode = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${phoneWithCountryCode}`
}

function buildResponseUrl(order: OrderEmailHtmlOrder) {
  const baseUrl = `${window.location.origin}${window.location.pathname}`
  const query = new URLSearchParams({
    orderCode: order.orderCode,
    customerName: order.customerName,
    phone: order.phone,
    itemType: order.itemType,
    serviceDescription: order.serviceDescription ?? '',
    problemDescription: order.problemDescription ?? '',
  })

  return `${baseUrl}#/responder?${query.toString()}`
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
  const phoneUrl = buildWhatsAppUrl(phone)
  const responseUrl = buildResponseUrl(order)
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

      <p style="margin: 24px 0 0;">
        <a href="${escapeHtml(responseUrl)}" style="display: inline-block; background: #7a3f18; color: #fff; padding: 12px 16px; border-radius: 4px; font-weight: bold; text-decoration: none;">
          Responder solicitação
        </a>
      </p>
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

function dataUrlSizeInBytes(dataUrl: string) {
  const base64 = dataUrl.split(',')[1] ?? ''
  return Math.ceil((base64.length * 3) / 4)
}

function stripDataUrlPrefix(dataUrl: string) {
  return dataUrl.replace(/^data:[^;]+;base64,/, '')
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Não foi possível carregar a imagem selecionada'))
    image.src = dataUrl
  })
}

async function readFileAsAttachment(file: Blob): Promise<{ dataUrl: string; size: number }> {
  const dataUrl = await readFileAsDataUrl(file)
  return { dataUrl, size: dataUrlSizeInBytes(dataUrl) }
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

function buildOrderAttachments(orderData: OrderEmailPayload): OrderEmailAttachment[] {
  const attachments = orderData.attachments?.length
    ? orderData.attachments
    : orderData.imageBase64
      ? [
          {
            filename: `${orderData.orderCode}.jpg`,
            contentType: 'image/jpeg',
            contentBase64: orderData.imageBase64,
          },
        ]
      : []

  return attachments.map((attachment) => ({
    ...attachment,
    contentBase64: stripDataUrlPrefix(attachment.contentBase64),
  }))
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
  const attachment = await fileToCompressedImage(file)
  return attachment.attachment
}

export async function fileToCompressedImage(file: File): Promise<CompressedOrderImage> {
  // Try client-side HEIC->JPEG conversion using heic2any loaded from CDN, then pica resizing.
  try {
    if (file.type === 'image/heic' || file.type === 'image/heif') {
      const cdn = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js'
      await new Promise<void>((resolve, reject) => {
        if ((window as any).heic2any) return resolve()
        const s = document.createElement('script')
        s.src = cdn
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('Failed to load heic2any from CDN'))
        document.head.appendChild(s)
      })

      const heic2any = (window as any).heic2any
      if (typeof heic2any === 'function') {
        // @ts-ignore
        const converted: Blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
        const convertedDataUrl = await readFileAsDataUrl(converted)
        // continue with pica resize using convertedDataUrl
        const sourceImage = await loadImage(convertedDataUrl)
        const maxSide = Math.max(sourceImage.naturalWidth, sourceImage.naturalHeight)
        const scale = maxSide > ATTACHMENT_MAX_DIMENSION ? ATTACHMENT_MAX_DIMENSION / maxSide : 1
        const width = Math.max(1, Math.round(sourceImage.naturalWidth * scale))
        const height = Math.max(1, Math.round(sourceImage.naturalHeight * scale))

        const srcCanvas = document.createElement('canvas')
        srcCanvas.width = sourceImage.naturalWidth
        srcCanvas.height = sourceImage.naturalHeight
        const sctx = srcCanvas.getContext('2d')
        if (!sctx) throw new Error('Não foi possível preparar a imagem')
        sctx.drawImage(sourceImage, 0, 0)

        const dstCanvas = document.createElement('canvas')
        dstCanvas.width = width
        dstCanvas.height = height

        // @ts-ignore
        const p = pica()
        // @ts-ignore
        await p.resize(srcCanvas, dstCanvas, { quality: 3 })
        // @ts-ignore
        const blob = await p.toBlob(dstCanvas, ATTACHMENT_IMAGE_TYPE, 0.86)
        const dataUrl = await readFileAsDataUrl(blob)
        const size = dataUrlSizeInBytes(dataUrl)
        const originalSizeMB = sizeInMB(file)
        const optimizedSizeMB = (size / 1024 / 1024).toFixed(2)
        const reductionPercent = file.size ? Math.max(0, Math.round(((file.size - size) / file.size) * 100)) : 0

        return {
          attachment: {
            filename: filenameWithMime(file.name, ATTACHMENT_IMAGE_TYPE),
            contentType: ATTACHMENT_IMAGE_TYPE,
            contentBase64: dataUrl,
          },
          originalSizeMB,
          optimizedSizeMB,
          reductionPercent,
        }
      }
    }
  } catch (heicErr) {
    console.warn('[image-processing] heic2any conversion failed, falling back to pica', { filename: file.name, error: heicErr })
  }

  try {
    let inputBlob: Blob = file
    let inputDataUrl = await readFileAsDataUrl(inputBlob)

    // Note: HEIC/HEIF browser conversion is not available here; pica will handle
    // resizing for JPEG/PNG/WebP. If HEIC needs support, prefer server-side `sharp`.

    const sourceImage = await loadImage(inputDataUrl)
    const maxSide = Math.max(sourceImage.naturalWidth, sourceImage.naturalHeight)
    const scale = maxSide > ATTACHMENT_MAX_DIMENSION ? ATTACHMENT_MAX_DIMENSION / maxSide : 1
    const width = Math.max(1, Math.round(sourceImage.naturalWidth * scale))
    const height = Math.max(1, Math.round(sourceImage.naturalHeight * scale))

    const srcCanvas = document.createElement('canvas')
    srcCanvas.width = sourceImage.naturalWidth
    srcCanvas.height = sourceImage.naturalHeight
    const sctx = srcCanvas.getContext('2d')
    if (!sctx) throw new Error('Não foi possível preparar a imagem')
    sctx.drawImage(sourceImage, 0, 0)

    const dstCanvas = document.createElement('canvas')
    dstCanvas.width = width
    dstCanvas.height = height

    // @ts-ignore
    const p = pica()
    // Resize using pica for stable high-quality results
    // @ts-ignore
    await p.resize(srcCanvas, dstCanvas, { quality: 3 })
    // @ts-ignore
    const blob = await p.toBlob(dstCanvas, ATTACHMENT_IMAGE_TYPE, 0.86)
    const dataUrl = await readFileAsDataUrl(blob)
    const size = dataUrlSizeInBytes(dataUrl)
    const originalSizeMB = sizeInMB(file)
    const optimizedSizeMB = (size / 1024 / 1024).toFixed(2)
    const reductionPercent = file.size ? Math.max(0, Math.round(((file.size - size) / file.size) * 100)) : 0

    return {
      attachment: {
        filename: filenameWithMime(file.name, ATTACHMENT_IMAGE_TYPE),
        contentType: ATTACHMENT_IMAGE_TYPE,
        contentBase64: dataUrl,
      },
      originalSizeMB,
      optimizedSizeMB,
      reductionPercent,
    }
  } catch (error) {
    console.warn('[image-processing] conversion/resizing failed, using original file as fallback', {
      filename: file.name,
      mimeType: file.type || 'desconhecido',
      error,
    })

    const originalAttachment = await readFileAsAttachment(file)
    const contentType = mimeFromDataUrl(originalAttachment.dataUrl, file.type || ATTACHMENT_IMAGE_TYPE)

    return {
      attachment: {
        filename: filenameWithMime(file.name, contentType),
        contentType,
        contentBase64: originalAttachment.dataUrl,
      },
      originalSizeMB: sizeInMB(file),
      optimizedSizeMB: sizeInMB(file),
      reductionPercent: 0,
    }
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
