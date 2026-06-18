import { Button } from '../components/Button'

const services = [
  { icon: '👞', label: 'Troca de sola' },
  { icon: '👠', label: 'Troca de salto' },
  { icon: '👜', label: 'Troca de ziper' },
  { icon: '🧵', label: 'Costura' },
  { icon: '🧥', label: 'Reforma de couro' },
  { icon: '📏', label: 'Ajuste de cinto' },
  { icon: '✨', label: 'Limpeza e hidratacao de couro' },
]

export function Home() {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-section__content">
          <p className="eyebrow">👋 Atendimento simples pelo WhatsApp</p>
          <h1>Sapataria Bebedouro</h1>
          <p className="hero-copy">Conserto de sapatos, bolsas, cintos e artigos de couro</p>
          <p>
            Envie fotos e detalhes pelo site, gere sua ordem de servico e confirme o pedido pelo
            WhatsApp. E rapido, claro e ajuda o sapateiro a avaliar melhor antes de voce sair de casa.
          </p>
          <div className="button-row">
            <Button to="/novo-pedido">📸 Solicitar orcamento</Button>
            <Button to="/consultar" variant="secondary">
              🔎 Consultar pedido
            </Button>
          </div>
        </div>
        <div className="hero-panel" aria-label="Resumo do atendimento">
          <span className="hero-panel__stamp" aria-hidden="true">🧰</span>
          <strong>Pedido com foto, codigo e resumo pronto.</strong>
          <p>Acompanhe pelo codigo da ordem e pelo WhatsApp informado no cadastro.</p>
          <div className="hero-panel__steps" aria-label="Passos do pedido">
            <span>📷 Foto</span>
            <span>🧾 Ordem</span>
            <span>💬 WhatsApp</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Informacoes da sapataria</p>
          <h2>Detalhes de atendimento</h2>
        </div>
        <div className="info-grid">
          <div className="info-box">
            <span>📍 Endereco</span>
            <strong>Endereco da sapataria sera informado</strong>
          </div>
          <div className="info-box">
            <span>⏰ Horario</span>
            <strong>Horario de atendimento sera informado</strong>
          </div>
          <div className="info-box">
            <span>💬 WhatsApp</span>
            <strong>WhatsApp sera informado</strong>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Servicos</p>
          <h2>O que voce pode solicitar</h2>
        </div>
        <div className="service-list">
          {services.map((service) => (
            <span key={service.label}>
              <span aria-hidden="true">{service.icon}</span>
              {service.label}
            </span>
          ))}
        </div>
      </section>
    </main>
  )
}
