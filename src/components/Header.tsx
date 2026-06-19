import { NavLink } from 'react-router-dom'

export function Header() {
  function scrollToTop() {
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 0)
  }

  return (
    <header className="site-header">
      <NavLink className="brand" to="/" aria-label="Ir para o inicio" onClick={scrollToTop}>
        <span className="brand__mark" aria-hidden="true">👞</span>
        <span>
          <strong>SAPATARIA BEBEDOURO</strong>
          <small>Consertos com capricho ✨</small>
        </span>
      </NavLink>
      <nav className="site-nav" aria-label="Navegacao principal">
        <NavLink to="/novo-pedido">🧾 Orçamento</NavLink>
        <NavLink to="/consultar">🔎 Consulta</NavLink>
      </nav>
    </header>
  )
}
