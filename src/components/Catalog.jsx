import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { BookOpen, Gamepad2, Filter, Search, Sparkles } from 'lucide-react'
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

  // Renderização das páginas
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ textAlign: 'center' }}>
            <Sparkles size={40} color="#1e3a5f" style={{ marginBottom: '16px', animation: 'pulse 1.5s infinite' }} />
            <p style={{ color: '#64748b' }}>Carregando acervo...</p>
          </div>
        </div>
      </>
    )
  }

  // Catálogo principal
  return (
    <>
      <Menu active="catalog" onNavigate={handleNavigate} />
      <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2c5a8c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '4px'
          }}>
            Acervo Sala 25
          </h1>
          <p style={{ fontSize: '12px', color: '#64748b' }}>{items.length} itens disponíveis</p>
        </div>
        
        {/* Busca */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '8px 16px', 
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <Search size={20} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar por título ou autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                fontSize: '14px',
                padding: '8px 0'
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
                  color: '#94a3b8'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* Filtros */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setFilter('todos')}
            style={{ 
              flex: 1, 
              padding: '10px', 
              border: 'none', 
              borderRadius: '10px', 
              cursor: 'pointer',
              backgroundColor: filter === 'todos' ? '#1e3a5f' : 'white',
              color: filter === 'todos' ? 'white' : '#475569',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: filter === 'todos' ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
              border: filter === 'todos' ? 'none' : '1px solid #e2e8f0',
              transition: 'all 0.2s'
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
              borderRadius: '10px', 
              cursor: 'pointer',
              backgroundColor: filter === 'livros' ? '#1e3a5f' : 'white',
              color: filter === 'livros' ? 'white' : '#475569',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: filter === 'livros' ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
              border: filter === 'livros' ? 'none' : '1px solid #e2e8f0'
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
              borderRadius: '10px', 
              cursor: 'pointer',
              backgroundColor: filter === 'jogos' ? '#1e3a5f' : 'white',
              color: filter === 'jogos' ? 'white' : '#475569',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: filter === 'jogos' ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
              border: filter === 'jogos' ? 'none' : '1px solid #e2e8f0'
            }}
          >
            <Gamepad2 size={16} />
            Jogos
          </button>
        </div>

        {/* Lista de itens */}
        <div>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', backgroundColor: 'white', borderRadius: '16px' }}>
              <Search size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Nenhum item encontrado</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Tente ajustar sua busca</p>
            </div>
          ) : (
            filteredItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => handleItemClick(item)}
                style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  padding: '12px', 
                  marginBottom: '12px', 
                  display: 'flex', 
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <div style={{ 
                  width: '64px', 
                  height: '80px', 
                  backgroundColor: '#f1f5f9', 
                  borderRadius: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {item.capa_url ? (
                    <img 
                      src={item.capa_url} 
                      alt={item.titulo} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} 
                    />
                  ) : (
                    getIcon(item.tipo)
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px', fontSize: '15px' }}>{item.titulo}</div>
                  {item.autores && (
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>{item.autores}</div>
                  )}
                  {item.tematicas && item.tematicas.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {item.tematicas.slice(0, 3).map(tema => (
                        <span key={tema} style={{ fontSize: '9px', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', color: '#475569' }}>{tema}</span>
                      ))}
                      {item.tematicas.length > 3 && (
                        <span style={{ fontSize: '9px', color: '#94a3b8' }}>+{item.tematicas.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total */}
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '16px', padding: '16px' }}>
          Mostrando {filteredItems.length} de {items.length} itens
        </div>
      </div>
    </>
  )
}

export default Catalog