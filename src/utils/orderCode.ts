import type { Order } from '../types/order'

export function generateOrderCode(orders: Order[]): string {
  const today = new Date().toISOString().slice(0, 10)
  const prefix = `${today}-`
  const lastNumberToday = orders.reduce((highest, order) => {
    if (!order.code.startsWith(prefix)) {
      return highest
    }

    const number = Number(order.code.slice(prefix.length))
    return Number.isFinite(number) ? Math.max(highest, number) : highest
  }, 0)

  return `${prefix}${String(lastNumberToday + 1).padStart(3, '0')}`
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}
