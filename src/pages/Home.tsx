import { useEffect, useState, useRef } from 'react'
import { Button } from '../components/Button'
import { staticAsset } from '../utils/staticAsset'

const services = [
  { icon: '👞', label: 'Troca de sola' },
  { icon: '👠', label: 'Troca de salto' },
  { icon: '👜', label: 'Troca de zíper' },
  { icon: '🧵', label: 'Costura' },
  { icon: '🧥', label: 'Reforma de couro' },
  { icon: '🕯️', label: 'Restauração de imagens religiosas' },
  { icon: '🖌️', label: 'Pintura e acabamento artesanal' },
  { icon: '🧰', label: 'Reparo em peças de artesanato' },
]

const galleryItems = [
  {
    image: staticAsset('gallery/sapato-marrom-antes-depois.png'),
    fallbackImage: staticAsset('gallery/trabalho-sapato.svg'),
    title: 'Antes e depois em sapato marrom',
  },
  {
    image: staticAsset('gallery/bota-branca-antes-depois.png'),
    fallbackImage: staticAsset('gallery/trabalho-sapato.svg'),
    title: 'Antes e depois em bota branca',
  },
  {
    image: staticAsset('gallery/bota-couro-antes-depois.png'),
    fallbackImage: staticAsset('gallery/trabalho-sapato.svg'),
    title: 'Antes e depois em bota de couro',
  },
  {
    image: staticAsset('gallery/sandalia-antes-depois.png'),
    fallbackImage: staticAsset('gallery/trabalho-sapato.svg'),
    title: 'Antes e depois em sandália',
  },
  {
    image: staticAsset('gallery/maquina-costura-sapato.png'),
    fallbackImage: staticAsset('gallery/trabalho-sapato.svg'),
    title: 'Sapato em máquina de costura',
  },
  {
    image: staticAsset('gallery/sapato-sola-palha.png'),
    fallbackImage: staticAsset('gallery/trabalho-sapato.svg'),
    title: 'Sola de calçado',
  },
  {
    image: staticAsset('gallery/loja-artesanato.png'),
    fallbackImage: staticAsset('gallery/trabalho-artesanato.svg'),
    title: 'Loja e artesanato',
  },
  {
    image: staticAsset('gallery/corujas-artesanais.png'),
    fallbackImage: staticAsset('gallery/trabalho-artesanato.svg'),
    title: 'Peças artesanais',
  },
  {
    image: staticAsset('gallery/artigos-religiosos.png'),
    fallbackImage: staticAsset('gallery/trabalho-religioso.svg'),
    title: 'Artigos religiosos',
  },
  {
    image: staticAsset('gallery/restauracao-santos.png'),
    fallbackImage: staticAsset('gallery/trabalho-religioso.svg'),
    title: 'Restauração de imagens',
  },
  {
    image: staticAsset('gallery/bonecos-artesanais.png'),
    fallbackImage: staticAsset('gallery/trabalho-artesanato.svg'),
    title: 'Bonecos artesanais',
  },
]

export function Home() {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const startTimer = () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
      timerRef.current = window.setInterval(() => {
        setActiveGalleryIndex((current) => (current + 1) % galleryItems.length)
      }, 7000)
    }

    startTimer()

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
    }
  }, [])

  const handleGalleryClick = (index: number) => {
    setActiveGalleryIndex(index)
    // Reseta o timer quando o usuário clica
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
    }
    timerRef.current = window.setInterval(() => {
      setActiveGalleryIndex((current) => (current + 1) % galleryItems.length)
    }, 7000)
  }

  function scrollToTop() {
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 0)
  }

  const activeGalleryItem = galleryItems[activeGalleryIndex]

  return (
    <main>
      <section className="hero-section hero-section--polished">
        <div className="hero-section__content">
          <p className="eyebrow">Orçamento simples pelo site</p>
          <h1>Sapataria Bebedouro</h1>
          <p className="hero-copy">
            Consertos em couro, artesanato e restauração de artigos religiosos
          </p>
          <p>
            Envie os detalhes pelo site e gere sua solicitação de avaliação. A sapataria
            analisa sapatos, bolsas, peças artesanais e muito mais. A loja também conta
            com itens disponíveis para aquisição na loja física.
          </p>
          <div className="hero-tags" aria-label="Áreas atendidas">
            <span>👜 Couro</span>
            <span>🖌️ Artesanato</span>
            <span>🕯️ Artigos religiosos</span>
            <span>🛍️ Loja física</span>
          </div>
          <div className="button-row">
            <Button to="/novo-pedido" onClick={scrollToTop}>📸 Orçamento</Button>
            <Button to="/consultar">🔎 Consulta</Button>
            <Button to="/loja">🛍️ Loja</Button>
          </div>
          <section className="work-carousel-section hero-gallery">
            <div className="section-heading section-heading--inline">
              <div>
                <p className="eyebrow">Trabalhos</p>
                <h2>Galeria</h2>
              </div>
            </div>
            <div className="work-carousel" aria-live="polite">
              <div
                className="work-carousel__media"
                style={{ backgroundImage: `url(${activeGalleryItem.image})` }}
              >
                <img
                  src={activeGalleryItem.image}
                  alt={activeGalleryItem.title}
                  data-fallback={activeGalleryItem.fallbackImage}
                  onError={(event) => {
                    if (event.currentTarget.dataset.fallbackUsed) {
                      return
                    }

                    event.currentTarget.dataset.fallbackUsed = 'true'
                    event.currentTarget.src = event.currentTarget.dataset.fallback ?? ''
                  }}
                />
              </div>
              <div className="work-carousel__dots" aria-label="Selecionar imagem">
                {galleryItems.map((item, index) => (
                  <button
                    aria-label={`Mostrar ${item.title}`}
                    className={index === activeGalleryIndex ? 'is-active' : ''}
                    key={item.title}
                    type="button"
                    onClick={() => handleGalleryClick(index)}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
        <div className="hero-panel" aria-label="Resumo do atendimento">
          <span className="hero-panel__stamp" aria-hidden="true">🧰</span>
          <strong>Orçamento com prazo e acompanhamento.</strong>
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
            <div className="info-box__top">
              <span>Endereço</span>
              <a
                className="info-box__link"
                href="https://maps.app.goo.gl/hcBaoXBWNuZ1T9De6"
                rel="noreferrer"
                target="_blank"
              >
                Abrir
                <svg className="info-box__icon info-box__icon--maps" aria-hidden="true" viewBox="0 0 20 20">
                  <path d="M10 18s6-5.1 6-10a6 6 0 0 0-12 0c0 4.9 6 10 6 10Z" />
                  <circle cx="10" cy="8" r="2" />
                </svg>
              </a>
            </div>
            <strong>Rua José Francisco Paschoal, 39 - Centro, Bebedouro - SP, 14701-030</strong>
          </div>

          <div className="info-box">
            <div className="info-box__top">
              <span>Telefone</span>
              <a className="info-box__link" href="tel:+551733458007">
                Ligar
                <svg className="info-box__icon info-box__icon--phone" aria-hidden="true" viewBox="0 0 20 20">
                  <path d="M6.3 3.5 8 7.2 6.7 8.4c.9 1.8 2.2 3.2 4 4l1.2-1.3 3.7 1.7-.5 3.1c-.1.5-.6.9-1.1.8C7.9 16.1 3.9 12.1 3.3 6c-.1-.5.3-1 .8-1.1l2.2-.4Z" />
                </svg>
              </a>
            </div>
            <strong>(17) 3345-8007</strong>
          </div>

          <div className="info-box">
            <div className="info-box__top">
              <span>Instagram</span>
              <a
                className="info-box__link"
                href="https://www.instagram.com/sapatariabebedouro_oficial/"
                rel="noreferrer"
                target="_blank"
              >
                Abrir
                <svg className="info-box__icon info-box__icon--instagram" aria-hidden="true" viewBox="0 0 20 20">
                  <defs>
                    <linearGradient id="instagram-icon-gradient" x1="3" x2="17" y1="17" y2="3">
                      <stop stopColor="#feda75" />
                      <stop offset="0.28" stopColor="#fa7e1e" />
                      <stop offset="0.55" stopColor="#d62976" />
                      <stop offset="0.78" stopColor="#962fbf" />
                      <stop offset="1" stopColor="#4f5bd5" />
                    </linearGradient>
                  </defs>
                  <rect x="4" y="4" width="12" height="12" rx="4" />
                  <circle cx="10" cy="10" r="3" />
                  <circle cx="13.8" cy="6.2" r="0.6" />
                </svg>
              </a>
            </div>
            <strong>@sapatariabebedouro_oficial</strong>
          </div>

          <div className="info-box">
            <div className="info-box__top">
              <span>Horário</span>
            </div>
            <strong>Horário de atendimento será informado</strong>
          </div>
          <div className="info-box">
            <div className="info-box__top">
              <span>Retorno</span>
            </div>
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
