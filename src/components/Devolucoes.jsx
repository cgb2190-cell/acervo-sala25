import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, CheckCircle, BookOpen, Gamepad2, Calendar, User, BookHeart } from 'lucide-react'
import { toast } from 'sonner'
import Modal from './Modal'

function Devolucoes({ onBack }) {
  const [reservasAtivas, setReservasAtivas] = useState([])
  const [loading, setLoading] = useState(true)
  const [processando, setProcessando] = useState(false)
  
  // Estados do formulário
  const [recursoSelecionado, setRecursoSelecionado] = useState('')
  const [slotSelecionado, setSlotSelecionado] = useState('')
  const [nomeSelecionado, setNomeSelecionado] = useState('')
  const [resumo, setResumo] = useState(null)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  
  const [recursosUnicos, setRecursosUnicos] = useState([])
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
      const recursos = [...new Set(data.map(r => r.acervo?.titulo).filter(Boolean))].sort()
      setRecursosUnicos(recursos)
    } else {
      setReservasAtivas([])
      setRecursosUnicos([])
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

  function handleRecursoChange(recurso) {
    setRecursoSelecionado(recurso)
    setSlotSelecionado('')
    setNomeSelecionado('')
    setResumo(null)
    
    const reservasDoRecurso = reservasAtivas.filter(r => r.acervo?.titulo === recurso)
    const slots = []
    const seen = new Set()
    
    reservasDoRecurso.forEach(r => {
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
      r.acervo?.titulo === recursoSelecionado && 
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

  function handleConfirmarDevolucao() {
    if (!resumo) return
    setConfirmModalOpen(true)
  }

  async function registrarDevolucao() {
    setConfirmModalOpen(false)
    setProcessando(true)
    
    const { data, error } = await supabase.rpc('registrar_devolucao', {
      p_reserva_id: resumo.reservaId
    })

    if (error) {
      toast.error('Erro: ' + error.message)
    } else if (data && !data.success) {
      toast.error(data.message)
    } else {
      toast.success('Devolução registrada com sucesso!')
      setRecursoSelecionado('')
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
          {/* Recurso terapêutico */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13, color: '#374151' }}>
              <BookHeart size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Recurso terapêutico
            </label>
            <select
              value={recursoSelecionado}
              onChange={(e) => handleRecursoChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">Selecione o recurso...</option>
              {recursosUnicos.map(recurso => (
                <option key={recurso} value={recurso}>{recurso}</option>
              ))}
            </select>
          </div>

          {/* Data e horário */}
          {recursoSelecionado && slotsDisponiveis.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13, color: '#374151' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Data e horário
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

          {/* Reservado por */}
          {slotSelecionado && pessoasDisponiveis.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13, color: '#374151' }}>
                <User size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Reservado por
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
              onClick={handleConfirmarDevolucao}
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

      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={registrarDevolucao}
        title="Confirmar Devolução"
        message={`Confirmar devolução de "${resumo?.livro}" para ${resumo?.nome}?`}
        confirmText="Sim, devolver"
        cancelText="Cancelar"
      />
    </div>
  )
}

export default Devolucoes