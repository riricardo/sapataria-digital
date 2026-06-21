import { useLayoutEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Admin } from './pages/Admin'
import { AdminOrderDetails } from './pages/AdminOrderDetails'
import { CheckOrder } from './pages/CheckOrder'
import { Home } from './pages/Home'
import { NewOrder } from './pages/NewOrder'
import { Shop } from './pages/Shop'

function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/novo-pedido" element={<NewOrder />} />
        <Route path="/consultar" element={<CheckOrder />} />
        <Route path="/loja" element={<Shop />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/pedido/:id" element={<AdminOrderDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
