import { NavLink } from 'react-router-dom'

export function Header() {
  return (
    <header className="site-header">
      <NavLink className="brand" to="/" aria-label="Ir para o inicio">
        <span className="brand__mark" aria-hidden="true">👞</span>
        <span>
          <strong>Sapataria Bebedouro</strong>
          <small>Consertos com capricho ✨</small>
        </span>
      </NavLink>
      <nav className="site-nav" aria-label="Navegacao principal">
        <NavLink to="/novo-pedido">🧾 Pedido</NavLink>
        <NavLink to="/consultar">🔎 Consultar</NavLink>
      </nav>
    </header>
  )
}
