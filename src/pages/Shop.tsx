import { staticAsset } from '../utils/staticAsset'

type ShopItem = {
  title: string
  price: string
  image: string
  images?: string[]
  description?: string
}

const shopItems: ShopItem[] = [
  {
    title: 'Carteira de couro',
    price: 'R$ 89,90',
    image: staticAsset('shop/carteira-couro.svg'),
    images: [
      staticAsset('shop/carteira-couro.svg'),
      staticAsset('shop/carteira-couro-2.svg'),
      staticAsset('shop/carteira-couro-3.svg'),
    ],
    description: 'Modelo compacto para uso diário.',
  },
  {
    title: 'Terço artesanal',
    price: 'R$ 45,00',
    image: staticAsset('shop/terco-artesanal.svg'),
    description: 'Peça artesanal disponível na loja.',
  },
  {
    title: 'Cinto social',
    price: 'R$ 79,90',
    image: staticAsset('shop/cinto-social.svg'),
  },
  {
    title: 'Chaveiro artesanal',
    price: 'R$ 24,90',
    image: staticAsset('shop/chaveiro-artesanal.svg'),
    description: 'Sugestão de presente simples e útil.',
  },
  {
    title: 'Imagem decorativa',
    price: 'R$ 120,00',
    image: staticAsset('shop/imagem-decorativa.svg'),
    description: 'Item de exemplo para artigos religiosos e decoração.',
  },
  {
    title: 'Bolsa pequena',
    price: 'R$ 149,90',
    image: staticAsset('shop/bolsa-pequena.svg'),
  },
]

export function Shop() {
  return (
    <main className="page-shell">
      <section className="shop-page">
        <div className="section-heading shop-page__heading">
          <p className="eyebrow">Loja</p>
          <h1>Artigos à venda</h1>
          <p>Itens disponível para aquisição na loja física.</p>
        </div>

        <div className="shop-grid">
          {shopItems.map((item) => {
            const images = item.images ?? [item.image]

            return (
              <article className="shop-card" key={item.title}>
                <div className="shop-card__media">
                  <div
                    className={`shop-card__gallery ${images.length > 1 ? 'shop-card__gallery--scrollable' : ''}`}
                    aria-label={`Fotos de ${item.title}`}
                  >
                    {images.map((image, index) => (
                      <img
                        alt={`${item.title} ${index + 1}`}
                        key={image}
                        src={image}
                      />
                    ))}
                  </div>
                  {images.length > 1 ? <span className="shop-card__photo-count">{images.length} fotos</span> : null}
                  <strong>{item.price}</strong>
                </div>
                <div className="shop-card__body">
                  <h2>{item.title}</h2>
                  {item.description ? <p>{item.description}</p> : null}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
