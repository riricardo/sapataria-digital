import { Navigate, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { Admin } from './pages/Admin'
import { AdminOrderDetails } from './pages/AdminOrderDetails'
import { CheckOrder } from './pages/CheckOrder'
import { Home } from './pages/Home'
import { NewOrder } from './pages/NewOrder'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/novo-pedido" element={<NewOrder />} />
        <Route path="/consultar" element={<CheckOrder />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/pedido/:id" element={<AdminOrderDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
