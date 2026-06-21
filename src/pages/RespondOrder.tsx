import { type FormEvent, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/Button'

function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

function formatOrderCodeForWhatsApp(orderCode: string) {
  return orderCode.replace(/[-_./]/g, ' ')
}

function buildWhatsAppUrl(phone: string, message: string) {
  const digits = onlyDigits(phone)
  if (!digits) {
    return ''
  }

  const phoneWithCountryCode = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(message)}`
}

function readParam(searchParams: URLSearchParams, key: string) {
  return searchParams.get(key)?.trim() ?? ''
}

export function RespondOrder() {
  const [searchParams] = useSearchParams()
  const order = useMemo(() => ({
    orderCode: readParam(searchParams, 'orderCode'),
    customerName: readParam(searchParams, 'customerName'),
    phone: readParam(searchParams, 'phone'),
    itemType: readParam(searchParams, 'itemType'),
    serviceDescription: readParam(searchParams, 'serviceDescription'),
    problemDescription: readParam(searchParams, 'problemDescription'),
  }), [searchParams])
  const [serviceValue, setServiceValue] = useState('')
  const [serviceDetails, setServiceDetails] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [error, setError] = useState('')

  const hasOrderData = Boolean(order.orderCode && order.customerName && order.phone)

  function buildMessage() {
    return [
      `Olá 👋 ${order.customerName || 'tudo bem'}! Aqui é da Sapataria Bebedouro.`,
      `Estou respondendo sobre a solicitação ${formatOrderCodeForWhatsApp(order.orderCode)} 📩`,
      '',
      `Item: ${order.itemType || 'Não informado'} 👜.`,
      `Serviço solicitado: ${order.serviceDescription || 'Não informado'} 🔧.`,
      order.problemDescription ? `Descrição enviada: ${order.problemDescription} 📝.` : '',
      '',
      `💰 Valor estimado do reparo: R$ ${serviceValue.trim()}.`,
      `🔍 Detalhamento do serviço: ${serviceDetails.trim()}.`,
      `⏳ Prazo estimado (fechando hoje): ${estimatedTime.trim()}.`,
      '',
      'Se estiver de acordo, podemos dar sequência ao serviço. ✅',
    ].filter(Boolean).join('\n')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!hasOrderData) {
      setError('Não foi possível carregar os dados da solicitação. Abra novamente pelo botão do e-mail.')
      return
    }

    if (!serviceValue.trim() || !serviceDetails.trim() || !estimatedTime.trim()) {
      setError('Preencha valor, detalhamento e estimativa de prazo para responder ao cliente.')
      return
    }

    const whatsappUrl = buildWhatsAppUrl(order.phone, buildMessage())
    if (!whatsappUrl) {
      setError('O WhatsApp do cliente não está válido.')
      return
    }

    setError('')
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <main className="page-shell">
      <section className="form-page response-page">
        <div className="section-heading">
          <p className="eyebrow">Responder solicitação</p>
          <h1>Montar resposta para o cliente</h1>
          <p>
            Preencha o valor, o detalhamento do serviço e o prazo estimado. O botão final
            abre o WhatsApp com a mensagem pronta para enviar.
          </p>
        </div>

        {hasOrderData ? (
          <div className="response-summary" aria-label="Resumo da solicitação">
            <p><strong>OS:</strong> {order.orderCode}</p>
            <p><strong>Cliente:</strong> {order.customerName}</p>
            <p><strong>WhatsApp:</strong> {order.phone}</p>
            <p><strong>Item:</strong> {order.itemType || 'Não informado'}</p>
            <p><strong>Serviço:</strong> {order.serviceDescription || 'Não informado'}</p>
            {order.problemDescription ? (
              <p><strong>Descrição:</strong> {order.problemDescription}</p>
            ) : null}
          </div>
        ) : (
          <div className="empty-state">
            <strong>Solicitação não encontrada.</strong>
            <p>Abra esta página pelo botão recebido no e-mail do pedido.</p>
          </div>
        )}

        <form className="form-grid single response-form" onSubmit={handleSubmit}>
          <label>
            Valor estimado do reparo
            <input
              inputMode="decimal"
              placeholder="Ex.: 85,00"
              value={serviceValue}
              onChange={(event) => setServiceValue(event.target.value)}
            />
          </label>

          <label>
            Detalhamento do serviço
            <textarea
              rows={5}
              placeholder="Ex.: troca da sola, colagem lateral, reforço da costura..."
              value={serviceDetails}
              onChange={(event) => setServiceDetails(event.target.value)}
            />
          </label>

          <label>
            Estimativa de prazo se fechar hoje
            <input
              placeholder="Ex.: 3 dias úteis"
              value={estimatedTime}
              onChange={(event) => setEstimatedTime(event.target.value)}
            />
          </label>

          {error ? <p className="form-error" role="alert">{error}</p> : null}

          <Button type="submit">Responder ao cliente pelo WhatsApp</Button>
        </form>
      </section>
    </main>
  )
}
