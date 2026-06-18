import { STATUS_LABELS, type OrderStatus } from '../types/order'

interface StatusBadgeProps {
  status: OrderStatus
}

const STATUS_EMOJIS: Record<OrderStatus, string> = {
  novo: '🧾',
  em_analise: '🔍',
  orcamento_enviado: '💬',
  aprovado: '👍',
  em_reparo: '🛠️',
  pronto: '🎉',
  entregue: '✅',
  cancelado: '✕',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status status--${status}`}>
      <span aria-hidden="true">{STATUS_EMOJIS[status]}</span>
      {STATUS_LABELS[status]}
    </span>
  )
}
