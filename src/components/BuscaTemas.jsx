import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, BookOpen, Gamepad2, Search, X } from 'lucide-react'

function BuscaTemas({ onBack }) {
  const [temas, setTemas] = useState([])
  const [temasSelecionados, setTemasSelecionados] = useState([])
  const [modoBusca, setModoBusca] = useState('ou') // 'ou' ou 'e'
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(false)
  const [todosItens, setTodosItens] = useState([])

  useEffect(() => {
    carregarTemas()
    carregarItens()
  }, [])

  async function carregarTemas() {
    const { data, error } = await supabase
      .from('temas')
      .select('nome')
      .order('nome')
    
    if (!error && data) {
      setTemas(data.map(t => t.nome))
    }
  }

  async function carregarItens() {
    const { data, error } = await supabase
      .from('acervo')
      .select('id, titulo, autores, tematicas, tipo, capa_url')
      .order('titulo')
    
    if (!error && data) {
      setTodosItens(data)
    }
  }

  function toggleTema(tema) {
    if (temasSelecionados.includes(tema)) {
      setTemasSelecionados(temasSelecionados.filter(t => t !== tema))
    } else {
      setTemasSelecionados([...temasSelecionados, tema])
    }
  }

  function limparTemas() {
    setTemasSelecionados([])
    setResultados([])
  }

  function buscar() {
    if (temasSelecionados.length === 0) {
      setResultados([])
      return
    }

    setLoading(true)

    const filtrados = todosItens.filter(item => {
      if (!item.tematicas || item.tematicas.length === 0) return false
      
      if (modoBusca === 'ou') {
        // Qualquer temática (OU)
        return temasSelecionados.some(tema => item.tematicas.includes(tema))
      } else {
        // Todas as temáticas (E)
        return temasSelecionados.every(tema => item.tematicas.includes(tema))
      }
    })

    setResultados(filtrados)
    setLoading(false)
  }

  useEffect(() => {
    buscar()
  }, [temasSelecionados, modoBusca])

  const getIcon = (tipo) => {
    if (tipo?.includes('livro')) return <BookOpen size={16} color="#2563eb" />
    return <Gamepad2 size={16} color="#16a34a" />
  }

  const getTipoLabel = (tipo) => {
    if (tipo?.includes('livro')) return 'Livro'
    return 'Jogo'
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
        <ArrowLeft size={18} /> Voltar
      </button>

      <h1 style={{ textAlign: 'center', color: '#1e3a5f', marginBottom: '20px' }}>
        Buscar por Temáticas
      </h1>

      {/* Modo de busca */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={() => setModoBusca('ou')}
          style={{
            padding: '6px 16px',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: modoBusca === 'ou' ? '#1e3a5f' : '#e5e7eb',
            color: modoBusca === 'ou' ? 'white' : '#374151',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
        >
          Qualquer tema (OU)
        </button>
        <button
          onClick={() => setModoBusca('e')}
          style={{
            padding: '6px 16px',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: modoBusca === 'e' ? '#1e3a5f' : '#e5e7eb',
            color: modoBusca === 'e' ? 'white' : '#374151',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
        >
          Todos os temas (E)
        </button>
      </div>

      {/* Chips de temas */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '200px', overflowY: 'auto', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
          {temas.map(tema => (
            <button
              key={tema}
              onClick={() => toggleTema(tema)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: temasSelecionados.includes(tema) ? '#1e3a5f' : '#d1d5db',
                backgroundColor: temasSelecionados.includes(tema) ? '#1e3a5f' : 'white',
                color: temasSelecionados.includes(tema) ? 'white' : '#374151',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.2s'
              }}
            >
              {tema}
            </button>
          ))}
        </div>
      </div>

      {/* Botão limpar */}
      {temasSelecionados.length > 0 && (
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <button
            onClick={limparTemas}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              margin: '0 auto'
            }}
          >
            <X size={14} />
            Limpar seleção
          </button>
        </div>
      )}

      {/* Resultados */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '12px', fontSize: '12px', color: '#6b7280' }}>
          {temasSelecionados.length === 0 ? (
            <span>Selecione um ou mais temas para buscar</span>
          ) : loading ? (
            <span>Buscando...</span>
          ) : (
            <span>{resultados.length} item(ns) encontrado(s)</span>
          )}
        </div>

        {resultados.length > 0 && (
          <div>
            {resultados.map(item => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '10px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex',
                  gap: '12px'
                }}
              >
                <div style={{ width: '48px', height: '64px', backgroundColor: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.capa_url ? (
                    <img src={item.capa_url} alt={item.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    getIcon(item.tipo)
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {getIcon(item.tipo)}
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.titulo}</span>
                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>({getTipoLabel(item.tipo)})</span>
                  </div>
                  {item.autores && (
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{item.autores}</div>
                  )}
                  {item.tematicas && item.tematicas.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                      {item.tematicas.map(tema => (
                        <span
                          key={tema}
                          style={{
                            fontSize: '9px',
                            backgroundColor: temasSelecionados.includes(tema) ? '#dbeafe' : '#f3f4f6',
                            color: temasSelecionados.includes(tema) ? '#1e40af' : '#6b7280',
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}
                        >
                          {tema}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {temasSelecionados.length > 0 && !loading && resultados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            Nenhum item encontrado com {modoBusca === 'ou' ? 'qualquer um dos' : 'todos os'} temas selecionados.
          </div>
        )}
      </div>
    </div>
  )
}

export default BuscaTemas