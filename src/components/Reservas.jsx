import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, CalendarX, BookOpen, Gamepad2, X, CalendarPlus } from 'lucide-react'

function Reservas({ onBack }) {
  const [semanas, setSemanas] = useState([])
  const [semanaSelecionada, setSemanaSelecionada] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reservasList, setReservasList] = useState([])
  const [diasDaSemana, setDiasDaSemana] = useState([])
  const [diasBloqueados, setDiasBloqueados] = useState([])
  const [diasBloqueadosInfo, setDiasBloqueadosInfo] = useState({})
  const [itens, setItens] = useState([])

  const [modalAberto, setModalAberto] = useState(false)
  const [itemSelecionado, setItemSelecionado] = useState(null)
  const [horarioSelecionado, setHorarioSelecionado] = useState(null)
  const [dataSelecionada, setDataSelecionada] = useState(null)
  const [diaSelecionado, setDiaSelecionado] = useState(null)
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [reservando, setReservando] = useState(false)
  const [conflito, setConflito] = useState(null)

  const horarios = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00']
  const diasNomes = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']

  useEffect(() => {
    carregarDados()
    const nomeSalvo = localStorage.getItem('nome_usuario')
    if (nomeSalvo) setNomeUsuario(nomeSalvo)
  }, [])

  async function carregarDados() {
    setLoading(true)
    
    const { data: bloqueadosData } = await supabase.from('dias_bloqueados').select('data, motivo')
    if (bloqueadosData) {
      setDiasBloqueados(bloqueadosData.map(d => d.data))
      const motivosMap = {}
      bloqueadosData.forEach(d => {
        motivosMap[d.data] = d.motivo
      })
      setDiasBloqueadosInfo(motivosMap)
    }
    
    const { data: itensData } = await supabase.from('acervo').select('id, titulo, tipo').order('titulo')
    if (itensData) setItens(itensData)
    
    const { data: semanasData } = await supabase.rpc('semanas_disponiveis', { p_proximas_semanas: 8 })
    if (semanasData && semanasData.length > 0) {
      setSemanas(semanasData)
      setSemanaSelecionada(0)
      const dias = calcularDias(semanasData[0].semana_inicio)
      setDiasDaSemana(dias)
      await carregarReservas(semanasData[0])
    }
    setLoading(false)
  }

  function calcularDias(dataInicioStr) {
    const [ano, mes, dia] = dataInicioStr.split('T')[0].split('-').map(Number)
    const dias = []
    for (let i = 0; i < 5; i++) {
      const d = new Date(ano, mes - 1, dia + i)
      const dStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      dias.push(dStr)
    }
    return dias
  }

  async function carregarReservas(semana) {
    const inicio = semana.dias[0]
    const fim = semana.dias[semana.dias.length - 1]
    const { data, error } = await supabase
      .from('reservas')
      .select('*, acervo(tipo, titulo)')
      .gte('data_uso', inicio)
      .lte('data_uso', fim)
    if (!error && data) {
      const normalized = data.map(r => {
        let horarioStr = r.horario
        if (typeof horarioStr === 'string' && horarioStr.length > 5) {
          horarioStr = horarioStr.substring(0, 5)
        }
        return { ...r, horarioNormalizado: horarioStr }
      })
      setReservasList(normalized)
    } else {
      setReservasList([])
    }
  }

  async function selecionarSemana(idx) {
    setSemanaSelecionada(idx)
    const semana = semanas[idx]
    const dias = calcularDias(semana.semana_inicio)
    setDiasDaSemana(dias)
    await carregarReservas(semana)
  }

  function formatarData(dataStr) {
    const [ano, mes, dia] = dataStr.split('-')
    return `${dia}/${mes}`
  }

  function isDiaBloqueado(data) {
    return diasBloqueados.includes(data)
  }

  function getMotivoBloqueio(data) {
    return diasBloqueadosInfo[data] || 'Feriado'
  }

  function getReservasDoHorario(dia, horario) {
    return reservasList.filter(r => {
      const dataReserva = r.data_uso.substring(0, 10)
      return dataReserva === dia && r.horarioNormalizado === horario
    })
  }

  function getCorCelula(dia, horario) {
    const reservas = getReservasDoHorario(dia, horario)
    if (reservas.length === 0) return '#ffffff'
    const todasDevolvidas = reservas.every(r => r.status === 'devolvido')
    if (todasDevolvidas) return '#d9ead3'
    return '#fff2cc'
  }

  function abrirModal(dia, horario, nomeDia) {
    if (isDiaBloqueado(dia)) {
      alert(`Este dia está bloqueado: ${getMotivoBloqueio(dia)}`)
      return
    }
    setDataSelecionada(dia)
    setHorarioSelecionado(horario)
    setDiaSelecionado(nomeDia)
    setItemSelecionado(null)
    setConflito(null)
    setModalAberto(true)
  }

  async function confirmarReserva() {
    if (!nomeUsuario.trim()) { alert('Digite seu nome'); return }
    if (!itemSelecionado) { alert('Selecione um item'); return }
    if (!confirm(`Confirmar reserva de "${itemSelecionado.titulo}" para ${dataSelecionada.split('-').reverse().join('/')} às ${horarioSelecionado}?`)) return

    setReservando(true)
    const { data, error } = await supabase.rpc('fazer_reserva', {
      p_item_id: itemSelecionado.id,
      p_usuario_nome: nomeUsuario.trim(),
      p_data_uso: dataSelecionada,
      p_horario: horarioSelecionado
    })

    if (error) {
      alert('Erro: ' + error.message)
    } else if (data && !data.success) {
      setConflito(data.message)
    } else {
      localStorage.setItem('nome_usuario', nomeUsuario.trim())
      setModalAberto(false)
      await carregarReservas(semanas[semanaSelecionada])
      alert('Reserva confirmada!')
    }
    setReservando(false)
  }

  const getIcon = (tipo, size = 12) => {
    if (tipo?.includes('livro')) return <BookOpen size={size} color="#2563eb" />
    return <Gamepad2 size={size} color="#16a34a" />
  }

  if (loading) return <div style={{ padding: 40 }}>Carregando...</div>

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: 16 }}>
      <button onClick={onBack} style={{ marginBottom: 20, cursor: 'pointer' }}>← Voltar</button>
      <h1 style={{ textAlign: 'center' }}>Reservas</h1>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0' }}>
        {semanas.map((s, idx) => (
          <button key={idx} onClick={() => selecionarSemana(idx)} style={{
            padding: '8px 12px',
            backgroundColor: semanaSelecionada === idx ? '#1e3a5f' : '#e5e7eb',
            color: semanaSelecionada === idx ? 'white' : '#374151',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer'
          }}>
            {formatarData(s.semana_inicio)} a {formatarData(s.semana_fim)}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
          <thead>
            <tr style={{ backgroundColor: '#1e3a5f', color: 'white' }}>
              <th style={{ padding: '10px 6px', border: '1px solid #ccc', fontSize: '12px', textAlign: 'center', width: '55px' }}>Horário</th>
              {diasDaSemana.map((dia, idx) => (
                <th key={idx} style={{ padding: '10px 4px', border: '1px solid #ccc', fontSize: '12px', textAlign: 'center', width: '95px' }}>
                  {diasNomes[idx]}<br/>{formatarData(dia)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horarios.map(horario => (
              <tr key={horario}>
                <td style={{ padding: '6px 2px', border: '1px solid #ccc', textAlign: 'center', fontWeight: 'bold', fontSize: '11px', backgroundColor: '#f9fafb' }}>{horario}</td>
                {diasDaSemana.map((dia, idx) => {
                  const bloqueado = isDiaBloqueado(dia)
                  const cor = bloqueado ? '#e5e7eb' : getCorCelula(dia, horario)
                  const reservasNoHorario = getReservasDoHorario(dia, horario)
                  const livre = !bloqueado
                  return (
                    <td key={idx} style={{ padding: '4px', border: '1px solid #ccc', textAlign: 'center', backgroundColor: cor, cursor: livre ? 'pointer' : 'default', verticalAlign: 'top' }}
                        onClick={() => livre && abrirModal(dia, horario, diasNomes[idx])}>
                      {bloqueado ? (
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>
                          <CalendarX size={12} />
                          <div style={{ fontSize: 9 }}>{getMotivoBloqueio(dia)}</div>
                        </div>
                      ) : (
                        <div>
                          {reservasNoHorario.map(r => (
                            <div key={r.id} style={{ marginBottom: 6, fontSize: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', lineHeight: 1.3, wordBreak: 'break-word' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', flexWrap: 'wrap' }}>
                                {getIcon(r.acervo?.tipo, 10)}
                                <span style={{ fontWeight: 'bold' }}>{r.acervo?.titulo}</span>
                                {r.status === 'devolvido' && <span style={{ color: '#2d6a2d', fontWeight: 'bold' }}>✓</span>}
                              </div>
                              <div style={{ fontSize: 9, color: '#555' }}>({r.usuario_nome})</div>
                            </div>
                          ))}
                          <div style={{ marginTop: reservasNoHorario.length > 0 ? 4 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CalendarPlus size={14} color="#9ca3af" />
                          </div>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Nova Reserva</h3>
              <button onClick={() => setModalAberto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>
            <div style={{ backgroundColor: '#f3f4f6', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
              {diaSelecionado}, {dataSelecionada?.split('-').reverse().join('/')} — {horarioSelecionado}
            </div>
            {conflito && (
              <div style={{ backgroundColor: '#fee2e2', padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#b91c1c', borderRadius: 8 }}>
                {conflito}
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Seu nome</label>
              <input type="text" value={nomeUsuario} onChange={e => setNomeUsuario(e.target.value)} placeholder="Nome completo" style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 8 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Item a reservar</label>
              <select value={itemSelecionado?.id || ''} onChange={e => setItemSelecionado(itens.find(i => i.id === e.target.value) || null)} style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 8 }}>
                <option value="">-- Selecione um item --</option>
                {itens.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.titulo} ({item.tipo?.includes('livro') ? 'Livro' : 'Jogo'})
                  </option>
                ))}
              </select>
            </div>
            <button onClick={confirmarReserva} disabled={reservando || !itemSelecionado || !nomeUsuario.trim()} style={{ width: '100%', padding: 12, backgroundColor: reservando || !itemSelecionado || !nomeUsuario.trim() ? '#9ca3af' : '#1e3a5f', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
              {reservando ? 'Reservando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reservas