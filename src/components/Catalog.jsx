import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { BookOpen, Gamepad2, Filter, Search } from 'lucide-react'
import ItemDetail from './ItemDetail'
import Reservas from './Reservas'
import Devolucoes from './Devolucoes'
import Ranking from './Ranking'
import BuscaTemas from './BuscaTemas'
import Admin from './Admin'
import Menu from './Menu'

function Catalog() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [paginaAtual, setPaginaAtual] = useState('catalog')

  useEffect(() => {
    async function fetchItems() {
      setLoading(true)
      const { data, error } = await supabase
        .from('acervo')
        .select('*')
        .order('titulo')
      
      if (error) {
        console.error('Erro:', error)
      } else {
        setItems(data)
      }
      setLoading(false)
    }
    
    fetchItems()
  }, [])

  const handleNavigate = (pagina) => {
    setPaginaAtual(pagina)
    setSelectedItem(null)
  }

  const filteredItems = items.filter(item => {
    if (filter === 'livros' && !item.tipo.includes('livro')) return false
    if (filter === 'jogos' && item.tipo !== 'jogo') return false
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const titleMatch = item.titulo.toLowerCase().includes(term)
      const authorMatch = item.autores ? item.autores.toLowerCase().includes(term) : false
      if (!titleMatch && !authorMatch) return false
    }
    
    return true
  })

  const getIcon = (tipo) => {
    if (tipo && tipo.includes('livro')) {
      return <BookOpen size={24} color="#2563eb" />
    }
    return <Gamepad2 size={24} color="#16a34a" />
  }

  const handleItemClick = (item) => {
    setSelectedItem(item)
  }

  const handleBack = () => {
    setSelectedItem(null)
  }

  if (paginaAtual === 'admin') {
    return (
      <>
        <Menu active="admin" onNavigate={handleNavigate} />
        <Admin onBack={() => handleNavigate('catalog')} />
      </>
    )
  }
  if (paginaAtual === 'buscaTemas') {
    return (
      <>
        <Menu active="buscaTemas" onNavigate={handleNavigate} />
        <BuscaTemas onBack={() => handleNavigate('catalog')} />
      </>
    )
  }
  if (paginaAtual === 'ranking') {
    return (
      <>
        <Menu active="ranking" onNavigate={handleNavigate} />
        <Ranking onBack={() => handleNavigate('catalog')} />
      </>
    )
  }
  if (paginaAtual === 'reservas') {
    return (
      <>
        <Menu active="reservas" onNavigate={handleNavigate} />
        <Reservas onBack={() => handleNavigate('catalog')} />
      </>
    )
  }
  if (paginaAtual === 'devolucoes') {
    return (
      <>
        <Menu active="devolucoes" onNavigate={handleNavigate} />
        <Devolucoes onBack={() => handleNavigate('catalog')} />
      </>
    )
  }
  if (selectedItem) {
    return (
      <>
        <Menu active="catalog" onNavigate={handleNavigate} />
        <ItemDetail itemId={selectedItem.id} onBack={handleBack} />
      </>
    )
  }
  if (loading) {
    return (
      <>
        <Menu active="catalog" onNavigate={handleNavigate} />
        <div style={{ textAlign: 'center', padding: '40px' }}>Carregando acervo...</div>
      </>
    )
  }

  return (
    <>
      <Menu active="catalog" onNavigate={handleNavigate} />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
        <h1 style={{ textAlign: 'center', color: '#1e3a5f', marginBottom: '20px' }}>Acervo Sala 25</h1>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '8px 12px', gap: '8px' }}>
            <Search size={20} color="#6b7280" />
            <input
              type="text"
              placeholder="Buscar por titulo ou autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                fontSize: '14px'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setFilter('todos')}
            style={{ 
              flex: 1, 
              padding: '10px', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              backgroundColor: filter === 'todos' ? '#1e3a5f' : '#e5e7eb',
              color: filter === 'todos' ? 'white' : '#374151',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Filter size={16} />
            Todos
          </button>
          <button 
            onClick={() => setFilter('livros')}
            style={{ 
              flex: 1, 
              padding: '10px', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              backgroundColor: filter === 'livros' ? '#1e3a5f' : '#e5e7eb',
              color: filter === 'livros' ? 'white' : '#374151',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <BookOpen size={16} />
            Livros
          </button>
          <button 
            onClick={() => setFilter('jogos')}
            style={{ 
              flex: 1, 
              padding: '10px', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              backgroundColor: filter === 'jogos' ? '#1e3a5f' : '#e5e7eb',
              color: filter === 'jogos' ? 'white' : '#374151',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Gamepad2 size={16} />
            Jogos
          </button>
        </div>

        <div>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              Nenhum item encontrado
            </div>
          ) : (
            filteredItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => handleItemClick(item)}
                style={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  padding: '12px', 
                  marginBottom: '12px', 
                  display: 'flex', 
                  gap: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ 
                  width: '64px', 
                  height: '80px', 
                  backgroundColor: '#e5e7eb', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  {item.capa_url ? (
                    <img 
                      src={item.capa_url} 
                      alt={item.titulo} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
                    />
                  ) : (
                    getIcon(item.tipo)
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>{item.titulo}</div>
                  {item.autores && (
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>{item.autores}</div>
                  )}
                  {item.tematicas && item.tematicas.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {item.tematicas.slice(0, 3).map(tema => (
                        <span key={tema} style={{ fontSize: '9px', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '12px' }}>{tema}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>
          Total: {filteredItems.length} itens
        </div>
      </div>
    </>
  )
}

export default Catalog