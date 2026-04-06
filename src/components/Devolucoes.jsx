import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, CheckCircle, BookOpen, Gamepad2, Calendar, User } from 'lucide-react'

function Devolucoes({ onBack }) {
  const [reservasAtivas, setReservasAtivas] = useState([])
  const [loading, setLoading] = useState(true)
  const [processando, setProcessando] = useState(false)
  
  // Estados do formulário
  const [livroSelecionado, setLivroSelecionado] = useState('')
  const [slotSelecionado, setSlotSelecionado] = useState('')
  const [nomeSelecionado, setNomeSelecionado] = useState('')
  const [resumo, setResumo] = useState(null)
  
  const [livrosUnicos, setLivrosUnicos] = useState([])
  const [slotsDisponiveis, setSlotsDisponiveis] = useState([])
  const [pessoasDisponiveis, setPessoasDisponiveis] = useState([])

  useEffect(() => {
    carregarReservasAtivas()
  }, [])

  async function carregarReservasAtivas() {
    setLoading(true)
    
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        *,
        acervo (titulo, tipo)
      `)
      .eq('status', 'reservado')

    if (!error && data) {
      setReservasAtivas(data)
      const livros = [...new Set(data.map(r => r.acervo?.titulo).filter(Boolean))].sort()
      setLivrosUnicos(livros)
    } else {
      setReservasAtivas([])
      setLivrosUnicos([])
    }
    setLoading(false)
  }

  function formatarData(dataStr) {
    const [ano, mes, dia] = dataStr.split('-')
    return `${dia}/${mes}`
  }

  function formatarHorario(horarioStr) {
    if (!horarioStr) return ''
    return horarioStr.length > 5 ? horarioStr.substring(0, 5) : horarioStr
  }

  const getIcon = (tipo, size = 16) => {
    if (tipo?.includes('livro')) return <BookOpen size={size} color="#2563eb" />
    return <Gamepad2 size={size} color="#16a34a" />
  }

  function handleLivroChange(livro) {
    setLivroSelecionado(livro)
    setSlotSelecionado('')
    setNomeSelecionado('')
    setResumo(null)
    
    const reservasDoLivro = reservasAtivas.filter(r => r.acervo?.titulo === livro)
    const slots = []
    const seen = new Set()
    
    reservasDoLivro.forEach(r => {
      const key = `${r.data_uso}|${r.horario}`
      if (!seen.has(key)) {
        seen.add(key)
        slots.push({
          key: key,
          label: `${formatarData(r.data_uso)} às ${formatarHorario(r.horario)}`
        })
      }
    })
    
    setSlotsDisponiveis(slots)
    setPessoasDisponiveis([])
  }

  function handleSlotChange(slotKey) {
    setSlotSelecionado(slotKey)
    setNomeSelecionado('')
    setResumo(null)
    
    const [data, horario] = slotKey.split('|')
    const pessoas = reservasAtivas.filter(r => 
      r.acervo?.titulo === livroSelecionado && 
      r.data_uso === data && 
      r.horario === horario
    )
    
    setPessoasDisponiveis(pessoas)
  }

  function handleNomeChange(nome, reservaId, itemTitulo, data, horario, tipo) {
    setNomeSelecionado(nome)
    setResumo({
      reservaId,
      livro: itemTitulo,
      nome: nome,
      data: formatarData(data),
      horario: formatarHorario(horario),
      tipo: tipo
    })
  }

  async function registrarDevolucao() {
    if (!resumo) return
    
    if (!confirm(`Confirmar devolução de "${resumo.livro}" para ${resumo.nome}?`)) return
    
    setProcessando(true)
    
    const { data, error } = await supabase.rpc('registrar_devolucao', {
      p_reserva_id: resumo.reservaId
    })

    if (error) {
      alert('Erro: ' + error.message)
    } else if (data && !data.success) {
      alert(data.message)
    } else {
      alert('✅ Devolução registrada com sucesso!')
      setLivroSelecionado('')
      setSlotSelecionado('')
      setNomeSelecionado('')
      setResumo(null)
      setSlotsDisponiveis([])
      setPessoasDisponiveis([])
      await carregarReservasAtivas()
    }
    
    setProcessando(false)
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Carregando...</div>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: 16 }}>
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

      <h1 style={{ textAlign: 'center', color: '#1e3a5f', marginBottom: '32px' }}>
        Registrar Devolução
      </h1>

      {reservasAtivas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', backgroundColor: '#f3f4f6', borderRadius: '12px' }}>
          Nenhum item emprestado no momento
        </div>
      ) : (
        <div>
          {/* 1. Livro / Recurso */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13, color: '#374151' }}>
              <BookOpen size={14} style={{ display: 'inline', marginRight: '6px' }} />
              1. Livro / Recurso
            </label>
            <select
              value={livroSelecionado}
              onChange={(e) => handleLivroChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">Selecione o livro...</option>
              {livrosUnicos.map(livro => (
                <option key={livro} value={livro}>{livro}</option>
              ))}
            </select>
          </div>

          {/* 2. Data e horário */}
          {livroSelecionado && slotsDisponiveis.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13, color: '#374151' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                2. Data e horário
              </label>
              <select
                value={slotSelecionado}
                onChange={(e) => handleSlotChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Selecione a data/horário...</option>
                {slotsDisponiveis.map(slot => (
                  <option key={slot.key} value={slot.key}>{slot.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* 3. Reservado por */}
          {slotSelecionado && pessoasDisponiveis.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13, color: '#374151' }}>
                <User size={14} style={{ display: 'inline', marginRight: '6px' }} />
                3. Reservado por
              </label>
              <select
                value={nomeSelecionado}
                onChange={(e) => {
                  const pessoa = pessoasDisponiveis[parseInt(e.target.value)]
                  if (pessoa) {
                    handleNomeChange(
                      pessoa.usuario_nome,
                      pessoa.id,
                      pessoa.acervo?.titulo,
                      pessoa.data_uso,
                      pessoa.horario,
                      pessoa.acervo?.tipo
                    )
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Selecione quem reservou...</option>
                {pessoasDisponiveis.map((pessoa, idx) => (
                  <option key={pessoa.id} value={idx}>{pessoa.usuario_nome}</option>
                ))}
              </select>
            </div>
          )}

          {/* Resumo */}
          {resumo && (
            <div style={{
              backgroundColor: '#EBF5FB',
              border: '1px solid #AED6F1',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '13px',
              lineHeight: '1.6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                {getIcon(resumo.tipo, 16)}
                <strong>Item:</strong> {resumo.livro}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <User size={14} color="#6b7280" />
                <strong>Reservado por:</strong> {resumo.nome}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={14} color="#6b7280" />
                <strong>Data:</strong> {resumo.data} às {resumo.horario}
              </div>
            </div>
          )}

          {/* Botão registrar */}
          {resumo && (
            <button
              onClick={registrarDevolucao}
              disabled={processando}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#3D7A3D',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                opacity: processando ? 0.6 : 1
              }}
            >
              <CheckCircle size={18} />
              {processando ? 'Processando...' : 'Registrar devolução'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Devolucoes