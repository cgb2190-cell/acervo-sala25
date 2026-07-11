import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BookOpen, Puzzle, Sparkles, Filter, Search, Hourglass } from 'lucide-react'
import Menu from './Menu'
import { slugify } from '../utils/slugify'

function Catalog() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const scrollPositionRef = useRef(0)

  // Restaurar estado do filtro e busca quando voltar
  useEffect(() => {
    if (location.state?.filter) {
      setFilter(location.state.filter)
    }
    if (location.state?.searchTerm) {
      setSearchTerm(location.state.searchTerm)
    }
  }, [location.state?.filter, location.state?.searchTerm])

  useEffect(() => {
    async function fetchItems() {
      setLoading(true)
      const { data, error } = await supabase
        .from('acervo')
        .select('*')
        .order('titulo')
      if (error) console.error('Erro:', error)
      else setItems(data)
      setLoading(false)
      
      // Restaurar a posição da rolagem DEPOIS de carregar os dados
      if (location.state?.scrollPosition) {
        setTimeout(() => {
          window.scrollTo(0, location.state.scrollPosition)
        }, 50)
      }
    }
    fetchItems()
  }, [])

  // Salvar a posição da rolagem quando o usuário rolar
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const filteredItems = items.filter(item => {
    if (filter === 'livros' && !item.tipo.includes('livro')) return false
    if (filter === 'jogos' && item.tipo !== 'jogo') return false
    if (filter === 'atividades' && item.tipo !== 'atividade') return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const titleMatch = item.titulo.toLowerCase().includes(term)
      const authorMatch = item.autores ? item.autores.toLowerCase().includes(term) : false
      if (!titleMatch && !authorMatch) return false
    }
    return true
  })

  const getIcon = (tipo, size = 24) => {
    if (tipo?.includes('livro')) return <BookOpen size={size} color="#2563eb" />
    if (tipo === 'jogo') return <Puzzle size={size} color="#16a34a" />
    return <Sparkles size={size} color="#7c3aed" />
  }

  function handleItemClick(item) {
    const position = scrollPositionRef.current
    const slug = slugify(item.titulo)
    navigate(`/item/${slug}`, { 
      state: { 
        scrollPosition: position,
        filter: filter,
        searchTerm: searchTerm,
        itemId: item.id
      }
    })
  }

  const filterBtns = [
    { id: 'todos',      label: 'Todos',      icon: <Filter size={14} /> },
    { id: 'livros',     label: 'Livros',     icon: <BookOpen size={14} /> },
    { id: 'jogos',      label: 'Jogos',      icon: <Puzzle size={14} /> },
    { id: 'atividades', label: 'Atividades', icon: <Sparkles size={14} /> },
  ]

  if (loading) {
    return (
      <>
        <Menu />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ textAlign: 'center' }}>
            <Hourglass size={40} color="#1e3a5f" style={{ marginBottom: '16px', animation: 'pulse 1.5s infinite' }} />
            <p style={{ color: '#64748b' }}>Carregando acervo...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Menu />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
        <h1 style={{ textAlign: 'center', color: '#1e3a5f', marginBottom: '20px' }}>Acervo Sala 25</h1>

        {/* Busca */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '8px 12px', gap: '8px' }}>
            <Search size={20} color="#6b7280" />
            <input
              type="text"
              placeholder="Buscar por título ou autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '14px' }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#6b7280' }}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {filterBtns.map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              style={{
                flex: 1, minWidth: '70px', padding: '8px 6px',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                backgroundColor: filter === btn.id ? '#1e3a5f' : '#e5e7eb',
                color: filter === btn.id ? 'white' : '#374151',
                fontWeight: 'bold', fontSize: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
              }}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Nenhum item encontrado</div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                style={{
                  background: 'white', borderRadius: '12px', padding: '12px',
                  marginBottom: '12px', display: 'flex', gap: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ width: '64px', height: '80px', backgroundColor: '#e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.capa_url ? (
                    <img src={item.capa_url} alt={item.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : getIcon(item.tipo)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
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