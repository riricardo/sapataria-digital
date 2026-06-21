import { Button } from '../components/Button'

const services = [
  { icon: '👞', label: 'Troca de sola' },
  { icon: '👠', label: 'Troca de salto' },
  { icon: '👜', label: 'Troca de zíper' },
  { icon: '🧵', label: 'Costura' },
  { icon: '🧥', label: 'Reforma de couro' },
  { icon: '📏', label: 'Ajuste de cinto' },
  { icon: '✨', label: 'Limpeza e hidratação de couro' },
]

export function Home() {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-section__content">
          <p className="eyebrow">👋 Orçamento simples pelo site</p>
          <h1>Sapataria Bebedouro</h1>
          <p className="hero-copy">Conserto de sapatos, bolsas, cintos e artigos de couro</p>
          <p>
            Envie fotos e detalhes pelo site, gere sua solicitação e encaminhe para avaliação.
            Depois a sapataria retorna com a situação do orçamento.
          </p>
          <div className="button-row">
            <Button to="/novo-pedido">📸 Orçamento</Button>
            <Button to="/consultar">🔎 Consulta</Button>
          </div>
        </div>
        <div className="hero-panel" aria-label="Resumo do atendimento">
          <span className="hero-panel__stamp" aria-hidden="true">🧰</span>
          <strong>Orçamento com foto, código e resumo pronto.</strong>
          <p>Acompanhe pelo código gerado ou pelo WhatsApp informado no cadastro.</p>
          <div className="hero-panel__steps" aria-label="Passos do pedido">
            <span>📋 Descrição</span>
            <span>📷 Foto</span>
            <span>🧾 Avaliação</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Informações da sapataria</p>
          <h2>Detalhes de atendimento</h2>
        </div>
        <div className="info-grid">
          <div className="info-box">
            <span>📍 Endereço</span>
            <strong>Endereço da sapataria será informado</strong>
          </div>
          <div className="info-box">
            <span>⏰ Horário</span>
            <strong>Horário de atendimento será informado</strong>
          </div>
          <div className="info-box">
            <span>📩 Retorno</span>
            <strong>A sapataria responderá após avaliar o item</strong>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Serviços</p>
          <h2>O que você pode solicitar</h2>
        </div>
        <div className="service-list">
          {services.map((service) => (
            <span className="service-item" key={service.label}>
              <span className="service-item__icon" aria-hidden="true">{service.icon}</span>
              {service.label}
            </span>
          ))}
        </div>
      </section>
    </main>
  )
}
