import { useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { OrderCard } from '../components/OrderCard'
import { clearOrders, createDemoOrders, getOrders } from '../services/orderStorage'
import { STATUS_LABELS, STATUS_OPTIONS, type Order, type OrderStatus } from '../types/order'

type Filter = 'todos' | OrderStatus

export function Admin() {
  const [orders, setOrders] = useState<Order[]>(() => getOrders())
  const [filter, setFilter] = useState<Filter>('todos')
  const [confirmClear, setConfirmClear] = useState(false)

  const filteredOrders = useMemo(() => {
    if (filter === 'todos') {
      return orders
    }
    return orders.filter((order) => order.status === filter)
  }, [filter, orders])

  function handleCreateDemo() {
    setOrders(createDemoOrders())
  }

  function handleClear() {
    clearOrders()
    setOrders([])
    setConfirmClear(false)
  }

  return (
    <main className="page-shell">
      <section className="admin-header">
        <div>
          <p className="eyebrow">🛠️ Area demonstrativa</p>
          <h1>Pedidos da sapataria</h1>
          <p>Use esta area para acompanhar pedidos, alterar status e enviar avisos pelo WhatsApp.</p>
        </div>
        <div className="admin-actions">
          <Button variant="secondary" onClick={handleCreateDemo}>✨ Criar dados demo</Button>
          <Button variant="danger" onClick={() => setConfirmClear(true)}>🧹 Limpar dados demo</Button>
        </div>
      </section>

      <section className="filters" aria-label="Filtros por status">
        <button className={filter === 'todos' ? 'is-active' : ''} type="button" onClick={() => setFilter('todos')}>
          Todos
        </button>
        {STATUS_OPTIONS.map((status) => (
          <button
            className={filter === status ? 'is-active' : ''}
            key={status}
            type="button"
            onClick={() => setFilter(status)}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
      </section>

      <section className="orders-list">
        {filteredOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </section>

      {!filteredOrders.length ? (
        <div className="empty-state">
          <strong>Nenhum pedido por aqui.</strong>
          <p>Crie um pedido novo pelo site ou gere dados demo para testar a administracao.</p>
        </div>
      ) : null}

      {confirmClear ? (
        <Modal
          title="Limpar dados demo?"
          onClose={() => setConfirmClear(false)}
          actions={
            <>
              <Button variant="danger" onClick={handleClear}>Sim, limpar dados</Button>
              <Button variant="secondary" onClick={() => setConfirmClear(false)}>Cancelar</Button>
            </>
          }
        >
          <p>Isso remove todos os pedidos salvos neste navegador.</p>
        </Modal>
      ) : null}
    </main>
  )
}
