import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Medal, Award } from 'lucide-react'

function Ranking({ onBack }) {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarRanking()
  }, [])

  async function carregarRanking() {
    setLoading(true)
    
    const { data, error } = await supabase.rpc('ranking_uso', { p_limite: 20 })

    if (!error && data) {
      setRanking(data)
    } else {
      setRanking([])
    }
    setLoading(false)
  }

  function getMedalIcon(posicao) {
    switch(posicao) {
      case 1:
        return <Medal size={20} color="#fbbf24" />
      case 2:
        return <Medal size={20} color="#9ca3af" />
      case 3:
        return <Medal size={20} color="#cd7f32" />
      default:
        return <Award size={18} color="#9ca3af" />
    }
  }

  function getBarraWidth(total, max) {
    return max > 0 ? (total / max) * 100 : 0
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Carregando ranking...</div>
  }

  const maxReservas = ranking.length > 0 ? ranking[0].total_reservas : 0

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

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ textAlign: 'center', color: '#1e3a5f', marginBottom: '32px' }}>
  Ranking de Uso
</h1>
      </div>

      {ranking.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', backgroundColor: '#f3f4f6', borderRadius: '12px' }}>
          Nenhum uso registrado ainda.
          <br />
          <span style={{ fontSize: '12px' }}>Faça reservas para aparecerem no ranking.</span>
        </div>
      ) : (
        <div>
          {ranking.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                marginBottom: '8px',
                backgroundColor: index < 3 ? '#fefce8' : 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ width: '40px', textAlign: 'center' }}>
                {getMedalIcon(item.posicao)}
                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                  {item.posicao}º
                </div>
              </div>

              <div style={{ flex: 2, fontWeight: 'bold', fontSize: '14px', color: '#374151', wordBreak: 'break-word' }}>
                {item.livro}
              </div>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  flex: 1, 
                  height: '8px', 
                  backgroundColor: '#e5e7eb', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${getBarraWidth(item.total_reservas, maxReservas)}%`, 
                    height: '100%', 
                    backgroundColor: '#1e3a5f',
                    borderRadius: '4px'
                  }} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a5f', minWidth: '35px' }}>
                  {item.total_reservas}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Ranking