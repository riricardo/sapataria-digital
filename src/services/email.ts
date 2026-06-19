import type { Order } from '../types/order'

const SHOP_EMAIL = 'email-da-sapataria@exemplo.com'

function encodeEmailPart(value: string): string {
  return encodeURIComponent(value)
}

export function buildOrderEmailUrl(order: Order): string {
  const subject = `Orçamento ${order.code} - ${order.customerName}`
  const body = [
    'Olá! Gostaria de solicitar um orçamento pela Sapataria Bebedouro.',
    '',
    `Ordem de serviço: ${order.code}`,
    `Cliente: ${order.customerName}`,
    `WhatsApp para retorno: ${order.phone}`,
    `Item: ${order.itemType}`,
    `Serviço desejado: ${order.service}`,
    `Descrição: ${order.description}`,
    '',
    'Se houver fotos do item, anexe neste email antes de enviar.',
  ].join('\n')

  return `mailto:${SHOP_EMAIL}?subject=${encodeEmailPart(subject)}&body=${encodeEmailPart(body)}`
}
