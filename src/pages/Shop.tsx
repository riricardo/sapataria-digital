const assetBaseUrl = import.meta.env.BASE_URL

type ShopItem = {
  title: string
  price: string
  image: string
  description?: string
}

const shopItems: ShopItem[] = [
  {
    title: 'Carteira de couro',
    price: 'R$ 89,90',
    image: `${assetBaseUrl}shop/carteira-couro.svg`,
    description: 'Modelo compacto para uso diário.',
  },
  {
    title: 'Terço artesanal',
    price: 'R$ 45,00',
    image: `${assetBaseUrl}shop/terco-artesanal.svg`,
    description: 'Peça artesanal disponível na loja.',
  },
  {
    title: 'Cinto social',
    price: 'R$ 79,90',
    image: `${assetBaseUrl}shop/cinto-social.svg`,
  },
  {
    title: 'Chaveiro artesanal',
    price: 'R$ 24,90',
    image: `${assetBaseUrl}shop/chaveiro-artesanal.svg`,
    description: 'Sugestão de presente simples e útil.',
  },
  {
    title: 'Imagem decorativa',
    price: 'R$ 120,00',
    image: `${assetBaseUrl}shop/imagem-decorativa.svg`,
    description: 'Item de exemplo para artigos religiosos e decoração.',
  },
  {
    title: 'Bolsa pequena',
    price: 'R$ 149,90',
    image: `${assetBaseUrl}shop/bolsa-pequena.svg`,
  },
]

export function Shop() {
  return (
    <main className="page-shell">
      <section className="shop-page">
        <div className="section-heading">
          <p className="eyebrow">Loja</p>
          <h1>Artigos à venda</h1>
          <p>Itens disponível para aquisição na loja física.</p>
        </div>

        <div className="shop-grid">
          {shopItems.map((item) => (
            <article className="shop-card" key={item.title}>
              <img src={item.image} alt={item.title} />
              <div className="shop-card__body">
                <div>
                  <h2>{item.title}</h2>
                  {item.description ? <p>{item.description}</p> : null}
                </div>
                <strong>{item.price}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
