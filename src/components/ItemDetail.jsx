import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BookOpen, Puzzle, Sparkles, ArrowLeft, Share2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import Menu from './Menu'
import { slugify } from '../utils/slugify'

function RenderConteudo({ valor, style }) {
  if (!valor) return null
  const isHtml = /<[a-zA-Z][\s\S]*>/.test(valor)
  if (isHtml) {
    return <div className="tiptap-content" style={style} dangerouslySetInnerHTML={{ __html: valor }} />
  }
  return <p style={{ ...style, whiteSpace: 'pre-line', margin: 0 }}>{valor}</p>
}

function ItemDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchItem() {
      setLoading(true)
      setError(false)
      try {
        // Se veio com ID (fallback), busca por ID
        if (location.state?.itemId) {
          const { data, error } = await supabase
            .from('acervo')
            .select('*')
            .eq('id', location.state.itemId)
            .single()
          
          if (error) {
            console.error('Erro ao buscar item:', error)
            setError(true)
          } else if (data) {
            setItem(data)
          } else {
            setError(true)
          }
          setLoading(false)
          return
        }

        // Busca todos os itens e encontra pelo título
        const { data, error } = await supabase
          .from('acervo')
          .select('*')
          .order('titulo')
        
        if (error) {
          console.error('Erro ao buscar itens:', error)
          setError(true)
        } else if (data) {
          // Procura o item pelo slug do título
          const foundItem = data.find(item => slugify(item.titulo) === slug)
          if (foundItem) {
            setItem(foundItem)
          } else {
            setError(true)
          }
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Erro:', err)
        setError(true)
      }
      setLoading(false)
    }
    fetchItem()
  }, [slug, location.state?.itemId])

  const getIcon = (tipo) => {
    if (tipo?.includes('livro')) return <BookOpen size={48} color="#2563eb" />
    if (tipo === 'jogo') return <Puzzle size={48} color="#16a34a" />
    return <Sparkles size={48} color="#7c3aed" />
  }

  const getTipoLabel = (tipo) => {
    if (tipo === 'livro_capa_dura') return 'Livro Capa Dura'
    if (tipo === 'livro_capa_mole') return 'Livro Capa Mole'
    if (tipo === 'jogo') return 'Jogo'
    if (tipo === 'atividade') return 'Atividade'
    return tipo
  }

  function handleVoltar() {
    const scrollPosition = location.state?.scrollPosition || 0
    const filter = location.state?.filter || 'todos'
    const searchTerm = location.state?.searchTerm || ''
    
    navigate('/', { 
      state: { 
        scrollPosition: scrollPosition,
        filter: filter,
        searchTerm: searchTerm
      }
    })
  }

  async function compartilhar() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: item?.titulo || 'Item do Acervo', 
          text: `Confira este item do acervo: ${item?.titulo || ''}`,
          url: url 
        })
      } catch (e) {
        if (e.name !== 'AbortError') {
          await navigator.clipboard.writeText(url)
          toast.success('Link copiado!')
        }
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado!')
    }
  }

  // Tela de carregamento
  if (loading) {
    return (
      <>
        <Menu />
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Carregando detalhes...</p>
        </div>
      </>
    )
  }

  // Tela de erro - item não encontrado
  if (error || !item) {
    return (
      <>
        <Menu />
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
          <AlertCircle size={48} color="#dc2626" style={{ marginBottom: '16px' }} />
          <h2 style={{ color: '#1e3a5f', marginBottom: '8px' }}>Item não encontrado</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            O item que você está procurando pode ter sido removido ou o link está incorreto.
          </p>
          <button
            onClick={handleVoltar}
            style={{
              padding: '10px 24px',
              backgroundColor: '#1e3a5f',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Voltar para o acervo
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <Menu />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
        {/* Cabeçalho com voltar e compartilhar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button
            onClick={handleVoltar}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#1e3a5f', fontSize: '14px' }}
          >
            <ArrowLeft size={20} /> Voltar
          </button>
          <button
            onClick={compartilhar}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', color: '#1e3a5f', fontSize: '13px', padding: '6px 12px' }}
          >
            <Share2 size={16} /> Compartilhar
          </button>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          {/* Capa */}
          <div style={{ width: '100%', height: '200px', backgroundColor: '#f3f4f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            {item.capa_url ? (
              <img src={item.capa_url} alt={item.titulo} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }} />
            ) : getIcon(item.tipo)}
          </div>

          {/* Título */}
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>{item.titulo}</h1>

          {/* Tipo */}
          <div style={{ display: 'inline-block', backgroundColor: '#e5e7eb', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
            {getTipoLabel(item.tipo)}
          </div>

          {/* Autores */}
          {item.autores && (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Autores</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{item.autores}</p>
            </div>
          )}

          {/* Descrição */}
          {item.descricao && (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Descrição</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6', margin: 0 }}>{item.descricao}</p>
            </div>
          )}

          {/* Possibilidades de uso */}
          {item.possibilidades_uso && (
            <div style={{ marginBottom: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#166534', marginBottom: '8px' }}>Possibilidades de uso</h3>
              <RenderConteudo valor={item.possibilidades_uso} style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7' }} />
            </div>
          )}

          {/* Temáticas */}
          {item.tematicas && item.tematicas.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>Temáticas</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {item.tematicas.map(tema => (
                  <span key={tema} style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                    {tema}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.capa_drive_id && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              <a href={`https://drive.google.com/file/d/${item.capa_drive_id}/view`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: '12px', textDecoration: 'none' }}>
                Ver capa original no Google Drive
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ItemDetail