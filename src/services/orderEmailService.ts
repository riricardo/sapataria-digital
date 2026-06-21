const SEND_ORDER_EMAIL_URL =
  'https://sapataria-digital-api-fb596c9604ae.herokuapp.com/api/email/send-order'

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
  problemDescriptionFormatted?: string
  imageBase64?: string
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
    'DESCRIÇÃO DO PROBLEMA',
    orderData.problemDescription,
  ].join('\n')
}

interface OrderEmailResponse {
  success: boolean
  message?: string
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Erro ao ler imagem'))

    reader.readAsDataURL(file)
  })
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
