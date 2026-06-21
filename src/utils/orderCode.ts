import type { Order } from '../types/order'

export function generateOrderCode(orders: Order[]): string {
  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
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
