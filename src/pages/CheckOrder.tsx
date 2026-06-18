import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { StatusBadge } from '../components/StatusBadge'
import { findOrderByCodeAndPhone } from '../services/orderStorage'
import { buildOrderWhatsAppUrl } from '../services/whatsapp'
import type { Order } from '../types/order'

export function CheckOrder() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [searched, setSearched] = useState(false)
  const phoneRef = useRef<HTMLInputElement>(null)
  const codeRef = useRef<HTMLInputElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    phoneRef.current?.focus()
  }, [])

  function handleNextKey(event: KeyboardEvent<HTMLInputElement>, next?: HTMLElement | null) {
    if (event.key !== 'Enter') {
      return
    }
    event.preventDefault()
    next?.focus()
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setOrder(findOrderByCodeAndPhone(code, phone))
    setSearched(true)
  }

  return (
    <main className="page-shell">
      <section className="form-page narrow">
        <div className="section-heading">
          <p className="eyebrow">🔎 Acompanhe seu pedido</p>
          <h1>Consultar pedido</h1>
          <p>Informe o WhatsApp usado no cadastro e o codigo da ordem de servico.</p>
        </div>

        <form className="form-grid single" onSubmit={handleSubmit}>
          <label>
            WhatsApp
            <input
              ref={phoneRef}
              required
              inputMode="numeric"
              pattern="[0-9]*"
              value={phone}
              onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))}
              onKeyDown={(event) => handleNextKey(event, codeRef.current)}
              placeholder="Ex.: 17999999999"
            />
          </label>
          <label>
            Codigo da ordem
            <input
              ref={codeRef}
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={(event) => handleNextKey(event, submitRef.current)}
              placeholder="SD-0001"
            />
          </label>
          <Button ref={submitRef} type="submit">Buscar pedido ✨</Button>
        </form>

        {order ? (
          <article className="result-panel">
            <div className="result-panel__top">
              <strong>{order.code}</strong>
              <StatusBadge status={order.status} />
            </div>
            <p><strong>Item:</strong> {order.itemType}</p>
            <p><strong>Descricao:</strong> {order.description}</p>
            {order.budget ? <p><strong>Orcamento:</strong> {order.budget}</p> : null}
            {order.estimatedTime ? <p><strong>Prazo estimado:</strong> {order.estimatedTime}</p> : null}
            {order.note ? <p><strong>Observacao:</strong> {order.note}</p> : null}
            <a className="button button--secondary" href={buildOrderWhatsAppUrl(order)} target="_blank">
              💬 Falar no WhatsApp
            </a>
          </article>
        ) : null}

        {searched && !order ? (
          <div className="empty-state">
            <strong>Nao encontramos esse pedido.</strong>
            <p>Confira se o codigo e o WhatsApp estao iguais aos usados quando o pedido foi criado.</p>
          </div>
        ) : null}
      </section>
    </main>
  )
}
