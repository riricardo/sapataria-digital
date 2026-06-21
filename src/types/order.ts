export type OrderStatus =
  | 'novo'
  | 'em_analise'
  | 'orcamento_enviado'
  | 'aprovado'
  | 'em_reparo'
  | 'pronto'
  | 'entregue'
  | 'cancelado'

export type ItemType =
  | 'Sapato'
  | 'Bolsa'
  | 'Cinto'
  | 'Jaqueta'
  | 'Artigo religioso'
  | 'Artesanato'
  | 'Outro'

export interface Order {
  id: string
  code: string
  customerName: string
  phone: string
  itemType: ItemType
  service: string
  description: string
  imageBase64?: string
  imageBase64List?: string[]
  status: OrderStatus
  budget?: string
  estimatedTime?: string
  note?: string
  createdAt: string
  updatedAt: string
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  novo: 'Novo pedido',
  em_analise: 'Em analise',
  orcamento_enviado: 'Orçamento enviado',
  aprovado: 'Aprovado',
  em_reparo: 'Em reparo',
  pronto: 'Pronto para retirada',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

export const STATUS_OPTIONS: OrderStatus[] = [
  'novo',
  'em_analise',
  'orcamento_enviado',
  'aprovado',
  'em_reparo',
  'pronto',
  'entregue',
  'cancelado',
]
