import type { Order } from '../types/order'

export const SHOP_WHATSAPP_NUMBER = '5517999999999'

function buildUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function buildOrderWhatsAppUrl(order: Order): string {
  const statusUrl = `${window.location.origin}/consultar`
  const message = [
    'Ola! Fiz uma solicitacao pela Sapataria Bebedouro.',
    `Ordem: ${order.code}`,
    `Nome: ${order.customerName}`,
    `WhatsApp: ${order.phone}`,
    `Item: ${order.itemType}`,
    `Servico desejado: ${order.service}`,
    `Descricao: ${order.description}`,
    `Link/Status: ${statusUrl}`,
    'As fotos foram anexadas no site. Se necessario, envie tambem as fotos por aqui.',
    'Por favor, poderia avaliar o orcamento?',
  ].join('\n')

  return buildUrl(SHOP_WHATSAPP_NUMBER, message)
}

export function buildBudgetWhatsAppUrl(order: Order): string {
  const message = [
    `Ola, ${order.customerName}! Aqui e da Sapataria Bebedouro.`,
    `Sobre a ordem ${order.code}:`,
    order.budget ? `Orcamento: ${order.budget}` : 'Orcamento: a confirmar',
    order.estimatedTime ? `Prazo estimado: ${order.estimatedTime}` : '',
    order.note ? `Observacao: ${order.note}` : '',
    'Podemos seguir com o conserto?',
  ]
    .filter(Boolean)
    .join('\n')

  return buildUrl(order.phone.replace(/\D/g, ''), message)
}

export function buildReadyWhatsAppUrl(order: Order): string {
  const message = [
    `Ola, ${order.customerName}! Seu pedido ${order.code} da Sapataria Bebedouro esta pronto para retirada.`,
    order.note ? `Observacao: ${order.note}` : '',
    'Qualquer duvida, pode responder por aqui.',
  ]
    .filter(Boolean)
    .join('\n')

  return buildUrl(order.phone.replace(/\D/g, ''), message)
}
