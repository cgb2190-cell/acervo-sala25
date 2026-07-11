import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Catalog from './components/Catalog'
import ItemDetail from './components/ItemDetail'
import Admin from './components/Admin'
import Ajuda from './components/Ajuda'
import BuscaTemas from './components/BuscaTemas'
import Devolucoes from './components/Devolucoes'
import Ranking from './components/Ranking'
import Reservas from './components/Reservas'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/ajuda" element={<Ajuda />} />
        <Route path="/busca-temas" element={<BuscaTemas />} />
        <Route path="/devolucoes" element={<Devolucoes />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/reservas" element={<Reservas />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App