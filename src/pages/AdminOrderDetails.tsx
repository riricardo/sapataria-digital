import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { StatusBadge } from '../components/StatusBadge'
import { deleteOrder, getOrders, updateOrder } from '../services/orderStorage'
import { STATUS_LABELS, STATUS_OPTIONS, type Order, type OrderStatus } from '../types/order'

export function AdminOrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(() => getOrders().find((item) => item.id === id) ?? null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!order) {
    return (
      <main className="page-shell">
        <div className="empty-state">
          <strong>Pedido não encontrado.</strong>
          <Link className="text-link" to="/admin">Voltar para administração</Link>
        </div>
      </main>
    )
  }

  const orderImages = order.imageBase64List?.length ? order.imageBase64List : order.imageBase64 ? [order.imageBase64] : []

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!order) {
      return
    }
    const updated = updateOrder(order.id, order)
    if (updated) {
      setOrder(updated)
    }
  }

  function setField(field: keyof Order, value: string) {
    setOrder((current) => (current ? { ...current, [field]: value } : current))
  }

  function handleDelete() {
    if (!order) {
      return
    }
    deleteOrder(order.id)
    navigate('/admin')
  }

  return (
    <main className="page-shell">
      <section className="details-layout">
        <div className="details-main">
          <Link className="text-link" to="/admin">Voltar para pedidos</Link>
          <div className="details-title">
            <div>
              <p className="eyebrow">🧾 Detalhe do pedido</p>
              <h1>{order.code}</h1>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="summary-list">
            <p><strong>Cliente:</strong> {order.customerName}</p>
            <p><strong>WhatsApp:</strong> {order.phone}</p>
            <p><strong>Item:</strong> {order.itemType}</p>
            <p><strong>Serviço:</strong> {order.service}</p>
            <p><strong>Descrição:</strong> {order.description}</p>
            <p><strong>Criado em:</strong> {new Date(order.createdAt).toLocaleString('pt-BR')}</p>
          </div>

          {orderImages.length ? (
            <div className="detail-gallery" aria-label="Fotos do pedido">
              {orderImages.map((image, index) => (
                <img
                  className="detail-image"
                  src={image}
                  alt={`Foto ${index + 1} do pedido ${order.code}`}
                  key={image}
                />
              ))}
            </div>
          ) : null}
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            Status
            <select value={order.status} onChange={(event) => setField('status', event.target.value as OrderStatus)}>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{STATUS_LABELS[status]}</option>
              ))}
            </select>
          </label>
          <label>
            Valor do orçamento
            <input value={order.budget ?? ''} onChange={(event) => setField('budget', event.target.value)} placeholder="Ex.: R$ 85,00" />
          </label>
          <label>
            Prazo estimado
            <input value={order.estimatedTime ?? ''} onChange={(event) => setField('estimatedTime', event.target.value)} placeholder="Ex.: 3 dias úteis" />
          </label>
          <label>
            Observação interna/para cliente
            <textarea rows={4} value={order.note ?? ''} onChange={(event) => setField('note', event.target.value)} />
          </label>

          <div className="form-actions stacked">
            <Button type="submit">💾 Salvar alterações</Button>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>🗑️ Excluir pedido</Button>
          </div>
        </form>
      </section>

      {confirmDelete ? (
        <Modal
          title="Excluir pedido?"
          onClose={() => setConfirmDelete(false)}
          actions={
            <>
              <Button variant="danger" onClick={handleDelete}>Sim, excluir pedido</Button>
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
            </>
          }
        >
          <p>O pedido {order.code} será removido do localStorage deste navegador.</p>
        </Modal>
      ) : null}
    </main>
  )
}
