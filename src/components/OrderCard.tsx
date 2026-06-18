import { Link } from 'react-router-dom'
import type { Order } from '../types/order'
import { StatusBadge } from './StatusBadge'

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  const mainImage = order.imageBase64List?.[0] ?? order.imageBase64

  return (
    <article className="order-card">
      {mainImage ? (
        <div className="order-card__photo">
          <img className="order-card__thumb" src={mainImage} alt={`Foto do pedido ${order.code}`} />
          {order.imageBase64List && order.imageBase64List.length > 1 ? (
            <span>{order.imageBase64List.length} fotos</span>
          ) : null}
        </div>
      ) : (
        <div className="order-card__empty">Sem foto</div>
      )}
      <div className="order-card__content">
        <div className="order-card__top">
          <strong>{order.code}</strong>
          <StatusBadge status={order.status} />
        </div>
        <h3>{order.customerName}</h3>
        <p>{order.itemType} - {order.service}</p>
        <small>
          {order.phone} - {new Date(order.createdAt).toLocaleDateString('pt-BR')}
        </small>
        <Link className="text-link" to={`/admin/pedido/${order.id}`}>
          Ver detalhes
        </Link>
      </div>
    </article>
  )
}
