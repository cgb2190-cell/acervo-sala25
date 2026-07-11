import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Catalog from './components/Catalog'
import ItemDetailPage from './components/ItemDetail'
import Reservas from './components/Reservas'
import Devolucoes from './components/Devolucoes'
import Ranking from './components/Ranking'
import BuscaTemas from './components/BuscaTemas'
import Ajuda from './components/Ajuda'
import Admin from './components/Admin'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/item/:id" element={<ItemDetailPage />} />
        <Route path="/reservas" element={<Reservas />} />
        <Route path="/devolucoes" element={<Devolucoes />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/temas" element={<BuscaTemas />} />
        <Route path="/ajuda" element={<Ajuda />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
