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
      return <BookOpen size={24} color="var(--primary)" />
    }
    return <Gamepad2 size={24} color="var(--secondary)" />
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
            <Sparkles size={40} color="var(--primary)" style={{ marginBottom: '16px', animation: 'pulse 1.5s infinite' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Carregando acervo...</p>
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
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '4px'
          }}>
            Acervo Sala 25
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{items.length} itens disponíveis</p>
        </div>
        
        {/* Busca */}
        <div style={{ marginBottom: '16px' }}>
          <div className="search-container">
            <Search size={20} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Buscar por título ou autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: 'var(--text-muted)'
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
            className={`filter-button ${filter === 'todos' ? 'filter-button-active' : 'filter-button-inactive'}`}
          >
            <Filter size={16} />
            Todos
          </button>
          <button 
            onClick={() => setFilter('livros')}
            className={`filter-button ${filter === 'livros' ? 'filter-button-active' : 'filter-button-inactive'}`}
          >
            <BookOpen size={16} />
            Livros
          </button>
          <button 
            onClick={() => setFilter('jogos')}
            className={`filter-button ${filter === 'jogos' ? 'filter-button-active' : 'filter-button-inactive'}`}
          >
            <Gamepad2 size={16} />
            Jogos
          </button>
        </div>

        {/* Lista de itens */}
        <div>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', borderRadius: '16px' }}>
              <Search size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Nenhum item encontrado</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Tente ajustar sua busca</p>
            </div>
          ) : (
            filteredItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => handleItemClick(item)}
                className="catalog-card"
              >
                <div className="catalog-card-image">
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
                  <div className="catalog-card-title">{item.titulo}</div>
                  {item.autores && (
                    <div className="catalog-card-author">{item.autores}</div>
                  )}
                  {item.tematicas && item.tematicas.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {item.tematicas.slice(0, 3).map(tema => (
                        <span key={tema} style={{ fontSize: '9px', backgroundColor: 'var(--gray-100)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text-secondary)' }}>{tema}</span>
                      ))}
                      {item.tematicas.length > 3 && (
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>+{item.tematicas.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total */}
        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px', padding: '16px' }}>
          Mostrando {filteredItems.length} de {items.length} itens
        </div>
      </div>
    </>
  )
}

export default Catalog