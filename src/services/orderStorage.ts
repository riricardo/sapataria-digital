import type { ItemType, Order, OrderStatus } from '../types/order'
import { generateOrderCode, normalizePhone } from '../utils/orderCode'

const STORAGE_KEY = 'sapataria-bebedouro-orders'

export interface NewOrderInput {
  customerName: string
  phone: string
  itemType: ItemType
  service: string
  description: string
  example?: string
  imageBase64?: string
  imageBase64List?: string[]
}

export function getOrders(): Order[] {
  const rawOrders = localStorage.getItem(STORAGE_KEY)
  if (!rawOrders) {
    return []
  }

  try {
    const parsed = JSON.parse(rawOrders) as Order[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

export function createOrder(input: NewOrderInput): Order {
  const orders = getOrders()
  const now = new Date().toISOString()
  const order: Order = {
    ...input,
    id: crypto.randomUUID(),
    code: generateOrderCode(orders),
    status: 'novo',
    createdAt: now,
    updatedAt: now,
  }

  saveOrders([order, ...orders])
  return order
}

export function updateOrder(orderId: string, changes: Partial<Order>): Order | null {
  const orders = getOrders()
  let updatedOrder: Order | null = null
  const updatedOrders = orders.map((order) => {
    if (order.id !== orderId) {
      return order
    }

    updatedOrder = {
      ...order,
      ...changes,
      updatedAt: new Date().toISOString(),
    }
    return updatedOrder
  })

  saveOrders(updatedOrders)
  return updatedOrder
}

export function deleteOrder(orderId: string): void {
  saveOrders(getOrders().filter((order) => order.id !== orderId))
}

export function findOrderByCode(code: string): Order | null {
  const normalizedCode = code.trim().toUpperCase()

  return getOrders().find((order) => order.code.toUpperCase() === normalizedCode) ?? null
}

export function findOrdersByPhone(phone: string): Order[] {
  const normalizedPhone = normalizePhone(phone)

  return getOrders().filter((order) => normalizePhone(order.phone) === normalizedPhone)
}

export function clearOrders(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function createDemoOrders(): Order[] {
  const now = new Date()
  const demoOrders: Order[] = [
    {
      id: crypto.randomUUID(),
      code: '2026-06-19-001',
      customerName: 'Maria Aparecida',
      phone: '17 99999-0101',
      itemType: 'Bolsa',
      service: 'Trocar ziper',
      description: 'O ziper da bolsa travou e uma parte do tecido abriu.',
      status: 'em_analise',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      code: '2026-06-19-002',
      customerName: 'Joao Carlos',
      phone: '17 98888-0202',
      itemType: 'Sapato',
      service: 'Troca de sola',
      description: 'A sola do sapato social esta descolando na ponta.',
      status: 'orcamento_enviado',
      budget: 'R$ 85,00',
      estimatedTime: '3 dias uteis',
      note: 'Cliente pediu retirada no fim da tarde.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ]

  saveOrders(demoOrders)
  return demoOrders
}

export function isValidStatus(status: string): status is OrderStatus {
  return [
    'novo',
    'em_analise',
    'orcamento_enviado',
    'aprovado',
    'em_reparo',
    'pronto',
    'entregue',
    'cancelado',
  ].includes(status)
}
