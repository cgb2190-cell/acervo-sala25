import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Lock, Plus, Trash2, Edit, Save, X, CalendarX, Tag, BookOpen, Gamepad2, Upload, Image as ImageIcon, LogOut, Search, SquarePen, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import Modal from './Modal'

function Admin({ onBack }) {
  const [autenticado, setAutenticado] = useState(false)
  const [aba, setAba] = useState('acervo')
  const [buscaAcervo, setBuscaAcervo] = useState('')
  
  // Estados do login
  const [senhaTemp, setSenhaTemp] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erroSenha, setErroSenha] = useState('')
  
  // Modal de login (para nome)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [nomeLogin, setNomeLogin] = useState('')
  
  // Modal de confirmação para exclusão
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [itemParaExcluir, setItemParaExcluir] = useState(null)
  
  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(false)
  const [editando, setEditando] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    autores: '',
    tematicas: '',
    tipo: 'livro_capa_dura',
    capa_url: '',
    capa_file: null,
    capa_preview: null
  })
  
  const [diasBloqueados, setDiasBloqueados] = useState([])
  const [novaData, setNovaData] = useState('')
  const [novoMotivo, setNovoMotivo] = useState('')
  
  const [temas, setTemas] = useState([])
  const [novoTema, setNovoTema] = useState('')

  const SENHA_ADMIN = import.meta.env.VITE_ADMIN_PASSWORD
  const [usuarioLogado, setUsuarioLogado] = useState('')

  useEffect(() => {
    const autenticadoSalvo = localStorage.getItem('admin_autenticado')
    const nomeSalvo = localStorage.getItem('admin_usuario')
    if (autenticadoSalvo === 'true' && nomeSalvo) {
      setAutenticado(true)
      setUsuarioLogado(nomeSalvo)
      carregarAcervo()
      carregarDiasBloqueados()
      carregarTemas()
    }
  }, [])

  async function registrarLog(acao, detalhes) {
    try {
      await supabase
        .from('admin_logs')
        .insert({
          usuario: usuarioLogado,
          acao: acao,
          detalhes: detalhes,
          data: new Date().toISOString()
        })
    } catch (error) {
      console.error('Erro ao registrar log:', error)
    }
  }

  async function carregarAcervo() {
    setLoading(true)
    const { data, error } = await supabase
      .from('acervo')
      .select('*')
      .order('titulo')
    if (!error && data) setItens(data)
    setLoading(false)
  }

  async function carregarDiasBloqueados() {
    const { data, error } = await supabase
      .from('dias_bloqueados')
      .select('*')
      .order('data')
    if (!error && data) {
      const dadosCorrigidos = data.map(d => {
        const dataStr = d.data.split('T')[0]
        const [ano, mes, dia] = dataStr.split('-')
        return {
          ...d,
          data_exibicao: `${dia}/${mes}/${ano}`,
          data_raw: dataStr
        }
      })
      setDiasBloqueados(dadosCorrigidos)
    }
  }

  async function carregarTemas() {
    const { data, error } = await supabase
      .from('temas')
      .select('*')
      .order('nome')
    if (!error && data) setTemas(data)
  }

  async function fazerUploadImagem(file, titulo) {
    if (!file) return null
    
    setUploading(true)
    
    const nomeSanitizado = titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 50) + '.jpg'
    
    const { data, error } = await supabase.storage
      .from('capas')
      .upload(nomeSanitizado, file, {
        contentType: file.type,
        upsert: true,
        cacheControl: '3600'
      })
    
    setUploading(false)
    
    if (error) {
      console.error('Erro upload:', error)
      toast.error('Erro ao fazer upload da imagem: ' + error.message)
      return null
    }
    
    const supabaseUrl = 'https://egtseoxoufhwysdtsjmi.supabase.co'
    const url = `${supabaseUrl}/storage/v1/object/public/capas/${nomeSanitizado}`
    return { url, nomeSanitizado }
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem (jpg, png, etc)')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (event) => {
      setFormData({ ...formData, capa_file: file, capa_preview: event.target.result })
    }
    reader.readAsDataURL(file)
  }

  async function salvarItem() {
    if (!formData.titulo.trim()) {
      toast.error('Título é obrigatório')
      return
    }

    const tematicasArray = formData.tematicas.split(';').map(t => t.trim()).filter(t => t)
    
    let capaUrl = formData.capa_url
    
    if (formData.capa_file) {
      const uploadResult = await fazerUploadImagem(formData.capa_file, formData.titulo)
      if (uploadResult) {
        capaUrl = uploadResult.url
      }
    }

    if (editando) {
      const updateData = {
        titulo: formData.titulo,
        autores: formData.autores,
        tematicas: tematicasArray,
        tipo: formData.tipo
      }
      if (capaUrl) updateData.capa_url = capaUrl
      
      const { error } = await supabase
        .from('acervo')
        .update(updateData)
        .eq('id', editando)
      
      if (error) {
        toast.error('Erro ao atualizar: ' + error.message)
      } else {
        await registrarLog('ATUALIZAR_ITEM', `Item: ${formData.titulo}`)
        toast.success('Item atualizado com sucesso!')
        setEditando(null)
        carregarAcervo()
        limparForm()
      }
    } else {
      const { error } = await supabase
        .from('acervo')
        .insert({
          titulo: formData.titulo,
          autores: formData.autores,
          tematicas: tematicasArray,
          tipo: formData.tipo,
          capa_url: capaUrl || null
        })
      
      if (error) {
        toast.error('Erro ao adicionar: ' + error.message)
      } else {
        await registrarLog('ADICIONAR_ITEM', `Item: ${formData.titulo}`)
        toast.success('Item adicionado com sucesso!')
        carregarAcervo()
        limparForm()
      }
    }
  }

  function confirmarExclusao(item) {
    setItemParaExcluir(item)
    setConfirmModalOpen(true)
  }

  async function excluirItem() {
    if (!itemParaExcluir) return
    
    const { error } = await supabase
      .from('acervo')
      .delete()
      .eq('id', itemParaExcluir.id)
    
    if (error) {
      toast.error('Erro ao excluir: ' + error.message)
    } else {
      await registrarLog('EXCLUIR_ITEM', `Item: ${itemParaExcluir.titulo}`)
      toast.success('Item excluído!')
      carregarAcervo()
    }
    setConfirmModalOpen(false)
    setItemParaExcluir(null)
  }

  function editarItem(item) {
    setEditando(item.id)
    setFormData({
      titulo: item.titulo,
      autores: item.autores || '',
      tematicas: item.tematicas ? item.tematicas.join('; ') : '',
      tipo: item.tipo,
      capa_url: item.capa_url || '',
      capa_file: null,
      capa_preview: item.capa_url || null
    })
  }

  function limparForm() {
    setFormData({
      titulo: '',
      autores: '',
      tematicas: '',
      tipo: 'livro_capa_dura',
      capa_url: '',
      capa_file: null,
      capa_preview: null
    })
    setEditando(null)
  }

  async function adicionarDiaBloqueado() {
    if (!novaData) {
      toast.error('Selecione uma data')
      return
    }

    const dataUTC = new Date(novaData)
    const dataFormatada = dataUTC.toISOString().split('T')[0]

    const { error } = await supabase
      .from('dias_bloqueados')
      .insert({ data: dataFormatada, motivo: novoMotivo || 'Bloqueio manual' })
    
    if (error) {
      toast.error('Erro: ' + error.message)
    } else {
      await registrarLog('ADICIONAR_BLOQUEIO', `Data: ${novaData} - ${novoMotivo}`)
      toast.success('Dia bloqueado adicionado!')
      setNovaData('')
      setNovoMotivo('')
      carregarDiasBloqueados()
    }
  }

  async function removerDiaBloqueado(id, data, motivo) {
    if (window.confirm(`Remover bloqueio de ${data}?`)) {
      const { error } = await supabase
        .from('dias_bloqueados')
        .delete()
        .eq('id', id)
      
      if (error) {
        toast.error('Erro: ' + error.message)
      } else {
        await registrarLog('REMOVER_BLOQUEIO', `Data: ${data} - ${motivo}`)
        toast.success('Bloqueio removido!')
        carregarDiasBloqueados()
      }
    }
  }

  async function adicionarTema() {
    if (!novoTema.trim()) {
      toast.error('Digite um tema')
      return
    }

    const { error } = await supabase
      .from('temas')
      .insert({ nome: novoTema.trim() })
    
    if (error) {
      toast.error('Erro: ' + error.message)
    } else {
      await registrarLog('ADICIONAR_TEMA', `Tema: ${novoTema}`)
      toast.success('Tema adicionado!')
      setNovoTema('')
      carregarTemas()
    }
  }

  async function removerTema(id, nome) {
    if (window.confirm(`Remover o tema "${nome}"?`)) {
      const { error } = await supabase
        .from('temas')
        .delete()
        .eq('id', id)
      
      if (error) {
        toast.error('Erro: ' + error.message)
      } else {
        await registrarLog('REMOVER_TEMA', `Tema: ${nome}`)
        toast.success('Tema removido!')
        carregarTemas()
      }
    }
  }

  // Funções de login
  function handleVerificarSenha() {
    if (senhaTemp === SENHA_ADMIN) {
      setErroSenha('')
      setLoginModalOpen(true)
    } else {
      setErroSenha('Senha incorreta')
    }
  }

  function handleConfirmarNome() {
    if (!nomeLogin.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    setLoginModalOpen(false)
    setAutenticado(true)
    setUsuarioLogado(nomeLogin.trim())
    localStorage.setItem('admin_autenticado', 'true')
    localStorage.setItem('admin_usuario', nomeLogin.trim())
    registrarLog('LOGIN', `Usuário ${nomeLogin} fez login`)
    carregarAcervo()
    carregarDiasBloqueados()
    carregarTemas()
    toast.success(`Bem-vindo(a), ${nomeLogin}!`)
    setSenhaTemp('')
    setNomeLogin('')
  }

  function handleLogout() {
    registrarLog('LOGOUT', `Usuário ${usuarioLogado} fez logout`)
    setAutenticado(false)
    localStorage.removeItem('admin_autenticado')
    localStorage.removeItem('admin_usuario')
    setSenhaTemp('')
    setNomeLogin('')
    toast.info('Você saiu da área administrativa')
  }

  if (!autenticado) {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '16px' }}>
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
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <SquarePen size={32} color="#1e3a5f" />
            <h2 style={{ margin: 0, color: '#1e3a5f' }}>Área Administrativa</h2>
          </div>
          <p style={{ marginBottom: '16px', color: '#6b7280', fontSize: '14px' }}>
            Aqui você pode:<br />
            • Adicionar ou editar livros e jogos<br />
            • Gerenciar dias bloqueados (feriados, greves)<br />
            • Gerenciar as temáticas disponíveis
          </p>
          <div style={{ position: 'relative' }}>
            <input
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="Senha de acesso"
              value={senhaTemp}
              onChange={(e) => setSenhaTemp(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleVerificarSenha()}
              style={{
                width: '100%',
                padding: '12px',
                paddingRight: '40px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '12px',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={() => setMostrarSenha(!mostrarSenha)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {erroSenha && <div style={{ color: '#dc2626', fontSize: '12px', marginBottom: '12px' }}>{erroSenha}</div>}
          <button
            onClick={handleVerificarSenha}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#1e3a5f',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Verificar
          </button>
        </div>

        <Modal
          isOpen={loginModalOpen}
          onClose={() => {
            setLoginModalOpen(false)
            setSenhaTemp('')
          }}
          onConfirm={handleConfirmarNome}
          title="Identificação"
          message="Digite seu nome para registro de atividades:"
          showInput={true}
          inputPlaceholder="Seu nome completo"
          inputValue={nomeLogin}
          onInputChange={setNomeLogin}
          confirmText="Acessar"
          cancelText="Cancelar"
          type="prompt"
        />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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
            fontSize: '14px'
          }}
        >
          <ArrowLeft size={18} /> Voltar
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>👤 {usuarioLogado}</span>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </div>

      <h1 style={{ textAlign: 'center', color: '#1e3a5f', marginBottom: '20px' }}>Administração</h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setAba('acervo')} style={{ padding: '8px 16px', backgroundColor: aba === 'acervo' ? '#1e3a5f' : '#e5e7eb', color: aba === 'acervo' ? 'white' : '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          <BookOpen size={16} style={{ display: 'inline', marginRight: '6px' }} /> Acervo
        </button>
        <button onClick={() => setAba('bloqueados')} style={{ padding: '8px 16px', backgroundColor: aba === 'bloqueados' ? '#1e3a5f' : '#e5e7eb', color: aba === 'bloqueados' ? 'white' : '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          <CalendarX size={16} style={{ display: 'inline', marginRight: '6px' }} /> Dias Bloqueados
        </button>
        <button onClick={() => setAba('temas')} style={{ padding: '8px 16px', backgroundColor: aba === 'temas' ? '#1e3a5f' : '#e5e7eb', color: aba === 'temas' ? 'white' : '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          <Tag size={16} style={{ display: 'inline', marginRight: '6px' }} /> Temas
        </button>
      </div>

      {aba === 'acervo' && (
        <div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0' }}>{editando ? 'Editar Item' : 'Adicionar Novo Item'}</h3>
            <div style={{ marginBottom: '8px' }}>
              <input type="text" placeholder="Título *" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />
              <input type="text" placeholder="Autores (separados por ;)" value={formData.autores} onChange={(e) => setFormData({ ...formData, autores: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />
              <input type="text" placeholder="Temáticas (separadas por ;)" value={formData.tematicas} onChange={(e) => setFormData({ ...formData, tematicas: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />
              <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '6px' }}>
                <option value="livro_capa_dura">Livro Capa Dura</option>
                <option value="livro_capa_mole">Livro Capa Mole</option>
                <option value="jogo">Jogo</option>
              </select>
              
              <div style={{ marginTop: '12px', marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>Capa (imagem)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#e5e7eb', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                    <Upload size={14} /> Selecionar imagem
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                  {formData.capa_file && <span style={{ fontSize: '11px', color: '#10b981' }}>Arquivo selecionado: {formData.capa_file.name}</span>}
                </div>
                {formData.capa_preview && <div style={{ marginTop: '8px' }}><img src={formData.capa_preview} alt="Preview" style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} /></div>}
                {uploading && <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '4px' }}>Enviando imagem...</div>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={salvarItem} disabled={uploading} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: uploading ? 0.6 : 1 }}>
                <Save size={16} /> {editando ? 'Atualizar' : 'Adicionar'}
              </button>
              {editando && <button onClick={limparForm} style={{ padding: '8px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0 }}>Itens do Acervo ({itens.length})</h3>
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Buscar item..." value={buscaAcervo} onChange={(e) => setBuscaAcervo(e.target.value)} style={{ padding: '6px 12px', paddingLeft: '28px', border: '1px solid #ccc', borderRadius: '20px', fontSize: '12px', width: '180px' }} />
                <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                {buscaAcervo && <button onClick={() => setBuscaAcervo('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#9ca3af' }}>✕</button>}
              </div>
            </div>
            {loading && <div>Carregando...</div>}
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {itens
                .filter(item => buscaAcervo === '' || item.titulo.toLowerCase().includes(buscaAcervo.toLowerCase()) || (item.autores && item.autores.toLowerCase().includes(buscaAcervo.toLowerCase())))
                .map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{item.titulo}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>{item.tipo === 'jogo' ? 'Jogo' : 'Livro'}</div>
                      {item.capa_url && <div style={{ fontSize: '10px', color: '#9ca3af' }}>Com capa</div>}
                    </div>
                    <div>
                      <button onClick={() => editarItem(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px', color: '#2563eb' }}><Edit size={18} /></button>
                      <button onClick={() => confirmarExclusao(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              {buscaAcervo && itens.filter(i => i.titulo.toLowerCase().includes(buscaAcervo.toLowerCase())).length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>Nenhum item encontrado para "{buscaAcervo}"</div>}
            </div>
          </div>
        </div>
      )}

      {aba === 'bloqueados' && (
        <div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Adicionar Bloqueio</h3>
            <input type="date" value={novaData} onChange={(e) => setNovaData(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />
            <input type="text" placeholder="Motivo (ex: Feriado, Greve, Recesso)" value={novoMotivo} onChange={(e) => setNovoMotivo(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />
            <button onClick={adicionarDiaBloqueado} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={16} /> Adicionar</button>
          </div>
          <div>
            <h3>Dias Bloqueados ({diasBloqueados.length})</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {diasBloqueados.map(dia => (
                <div key={dia.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
                  <div>
                    <div>{dia.data_exibicao}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{dia.motivo}</div>
                  </div>
                  <button onClick={() => removerDiaBloqueado(dia.id, dia.data_exibicao, dia.motivo)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {aba === 'temas' && (
        <div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Adicionar Tema</h3>
            <input type="text" placeholder="Nome do tema" value={novoTema} onChange={(e) => setNovoTema(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />
            <button onClick={adicionarTema} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={16} /> Adicionar Tema</button>
          </div>
          <div>
            <h3>Temas Disponíveis ({temas.length})</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {temas.map(tema => (
                <div key={tema.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f3f4f6', padding: '6px 12px', borderRadius: '20px' }}>
                  <Tag size={14} color="#6b7280" />
                  <span>{tema.nome}</span>
                  <button onClick={() => removerTema(tema.id, tema.nome)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' }}><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={excluirItem}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir "${itemParaExcluir?.titulo}"? Esta ação não pode ser desfeita.`}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
      />
    </div>
  )
}

export default Admin