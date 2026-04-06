import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { BookOpen, Gamepad2, ArrowLeft } from 'lucide-react'

function ItemDetail({ itemId, onBack }) {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchItem() {
      setLoading(true)
      const { data, error } = await supabase
        .from('acervo')
        .select('*')
        .eq('id', itemId)
        .single()
      
      if (error) {
        console.error('Erro:', error)
      } else {
        setItem(data)
      }
      setLoading(false)
    }
    
    fetchItem()
  }, [itemId])

  const getIcon = (tipo) => {
    if (tipo && tipo.includes('livro')) {
      return <BookOpen size={48} color="#2563eb" />
    }
    return <Gamepad2 size={48} color="#16a34a" />
  }

  const getTipoLabel = (tipo) => {
    if (tipo === 'livro_capa_dura') return 'Livro Capa Dura'
    if (tipo === 'livro_capa_mole') return 'Livro Capa Mole'
    if (tipo === 'jogo') return 'Jogo'
    return tipo
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Carregando detalhes...</div>
  }

  if (!item) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Item não encontrado</div>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#1e3a5f',
          marginBottom: '20px',
          fontSize: '14px'
        }}
      >
        <ArrowLeft size={20} />
        Voltar
      </button>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ 
          width: '100%', 
          height: '200px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          {item.capa_url ? (
            <img 
              src={item.capa_url} 
              alt={item.titulo} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                borderRadius: '12px'
              }} 
            />
          ) : (
            getIcon(item.tipo)
          )}
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>
          {item.titulo}
        </h1>

        <div style={{ 
          display: 'inline-block', 
          backgroundColor: '#e5e7eb', 
          padding: '4px 12px', 
          borderRadius: '20px', 
          fontSize: '12px',
          marginBottom: '16px'
        }}>
          {getTipoLabel(item.tipo)}
        </div>

        {item.autores && (
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Autores</h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>{item.autores}</p>
          </div>
        )}

        {item.tematicas && item.tematicas.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>Temáticas</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {item.tematicas.map(tema => (
                <span 
                  key={tema} 
                  style={{ 
                    backgroundColor: '#dbeafe', 
                    color: '#1e40af', 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '12px'
                  }}
                >
                  {tema}
                </span>
              ))}
            </div>
          </div>
        )}

        {item.capa_drive_id && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <a 
              href={`https://drive.google.com/file/d/${item.capa_drive_id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#2563eb', fontSize: '12px', textDecoration: 'none' }}
            >
              Ver capa original no Google Drive
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemDetail