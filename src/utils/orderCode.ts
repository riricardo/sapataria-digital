import type { Order } from '../types/order'

export function generateOrderCode(orders: Order[]): string {
  const lastNumber = orders.reduce((highest, order) => {
    const number = Number(order.code.replace('SD-', ''))
    return Number.isFinite(number) ? Math.max(highest, number) : highest
  }, 0)

  return `SD-${String(lastNumber + 1).padStart(4, '0')}`
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}
