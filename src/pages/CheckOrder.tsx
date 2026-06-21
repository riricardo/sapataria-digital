import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { StatusBadge } from '../components/StatusBadge'
import { findOrderByCode, findOrdersByPhone } from '../services/orderStorage'
import type { Order } from '../types/order'

type SearchMode = 'code' | 'phone'

export function CheckOrder() {
  const [searchMode, setSearchMode] = useState<SearchMode>('code')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [searched, setSearched] = useState(false)
  const phoneRef = useRef<HTMLInputElement>(null)
  const codeRef = useRef<HTMLInputElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (searchMode === 'code') {
      codeRef.current?.focus()
      return
    }

    phoneRef.current?.focus()
  }, [searchMode])

  function handleModeChange(mode: SearchMode) {
    setSearchMode(mode)
    setOrders([])
    setSearched(false)
  }

  function handleNextKey(event: KeyboardEvent<HTMLInputElement>, next?: HTMLElement | null) {
    if (event.key !== 'Enter') {
      return
    }
    event.preventDefault()
    next?.focus()
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (searchMode === 'code') {
      const foundOrder = findOrderByCode(code)
      setOrders(foundOrder ? [foundOrder] : [])
      setSearched(true)
      return
    }

    setOrders(findOrdersByPhone(phone))
    setSearched(true)
  }

  return (
    <main className="page-shell">
      <section className="form-page narrow">
        <div className="section-heading">
          <p className="eyebrow">🔎 Acompanhe seu pedido</p>
          <h1>Consulta</h1>
          <p>Consulte pelo número da ordem de serviço ou pelo WhatsApp usado no cadastro.</p>
        </div>

        <form className="form-grid single" onSubmit={handleSubmit}>
          <div className="segmented-control" aria-label="Tipo de consulta">
            <button
              className={searchMode === 'code' ? 'is-active' : ''}
              type="button"
              onClick={() => handleModeChange('code')}
            >
              Ordem de serviço
            </button>
            <button
              className={searchMode === 'phone' ? 'is-active' : ''}
              type="button"
              onClick={() => handleModeChange('phone')}
            >
              WhatsApp
            </button>
          </div>

          {searchMode === 'code' ? (
            <label>
              Número da ordem de serviço
              <input
                ref={codeRef}
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
                onKeyDown={(event) => handleNextKey(event, submitRef.current)}
                placeholder="Ex.: AAAA-MM-DD-XXX"
              />
            </label>
          ) : (
            <label>
              WhatsApp
              <input
                ref={phoneRef}
                required
                inputMode="numeric"
                pattern="[0-9]*"
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))}
                onKeyDown={(event) => handleNextKey(event, submitRef.current)}
                placeholder="Ex.: 17999999999"
              />
            </label>
          )}

          <Button ref={submitRef} type="submit">Buscar pedido ✨</Button>
        </form>

        {orders.length ? (
          <div className="results-list">
            {orders.map((order) => (
              <article className="result-panel" key={order.id}>
                <div className="result-panel__top">
                  <strong>{order.code}</strong>
                  <StatusBadge status={order.status} />
                </div>
                <p><strong>Item:</strong> {order.itemType}</p>
                <p><strong>Descrição:</strong> {order.description}</p>
                {order.budget ? <p><strong>Orçamento:</strong> {order.budget}</p> : null}
                {order.estimatedTime ? <p><strong>Prazo estimado:</strong> {order.estimatedTime}</p> : null}
                {order.note ? <p><strong>Observação:</strong> {order.note}</p> : null}
                <p className="notice">A sapataria entrará em contato com a atualização do orçamento ou retirada.</p>
              </article>
            ))}
          </div>
        ) : null}

        {searched && !orders.length ? (
          <div className="empty-state">
            <strong>Não encontramos pedido.</strong>
            <p>Confira se a informação digitada está igual à usada quando o pedido foi criado.</p>
          </div>
        ) : null}
      </section>
    </main>
  )
}
