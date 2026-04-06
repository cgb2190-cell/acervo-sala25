import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Lock, Plus, Trash2, Edit, Save, X, CalendarX, Tag, BookOpen, Gamepad2, Upload, Image as ImageIcon, LogOut, Search } from 'lucide-react'

function Admin({ onBack }) {
  const [autenticado, setAutenticado] = useState(false)
  const [senha, setSenha] = useState('')
  const [erroSenha, setErroSenha] = useState('')
  const [aba, setAba] = useState('acervo')
  const [buscaAcervo, setBuscaAcervo] = useState('')
  
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

  const SENHA_ADMIN = 'PBiasoli25!'

  useEffect(() => {
    const autenticadoSalvo = localStorage.getItem('admin_autenticado')
    if (autenticadoSalvo === 'true') {
      setAutenticado(true)
      carregarAcervo()
      carregarDiasBloqueados()
      carregarTemas()
    }
  }, [])

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
    if (!error && data) setDiasBloqueados(data)
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
      alert('Erro ao fazer upload da imagem: ' + error.message)
      return null
    }
    
    const supabaseUrl = 'https://egtseoxoufhwysdtsjmi.supabase.co'
    const url = `${supabaseUrl}/storage/v1/object/public/capas/${nomeSanitizado}`
    return { url, nomeSanitizado }
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    
    // Validação de tipo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem (jpg, png, etc)')
      return
    }
    
    // Validação de tamanho (max 5MB para celular)
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 5MB')
      return
    }
    
    // Criar preview local (isso funciona no celular)
    const reader = new FileReader()
    reader.onload = (event) => {
      setFormData({ ...formData, capa_file: file, capa_preview: event.target.result })
    }
    reader.readAsDataURL(file)
  }

  async function salvarItem() {
    if (!formData.titulo.trim()) {
      alert('Título é obrigatório')
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
        alert('Erro ao atualizar: ' + error.message)
      } else {
        alert('Item atualizado com sucesso!')
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
        alert('Erro ao adicionar: ' + error.message)
      } else {
        alert('Item adicionado com sucesso!')
        carregarAcervo()
        limparForm()
      }
    }
  }

  async function excluirItem(id) {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      const { error } = await supabase
        .from('acervo')
        .delete()
        .eq('id', id)
      
      if (error) {
        alert('Erro ao excluir: ' + error.message)
      } else {
        alert('Item excluído!')
        carregarAcervo()
      }
    }
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
      alert('Selecione uma data')
      return
    }

    const { error } = await supabase
      .from('dias_bloqueados')
      .insert({ data: novaData, motivo: novoMotivo || 'Bloqueio manual' })
    
    if (error) {
      alert('Erro: ' + error.message)
    } else {
      alert('Dia bloqueado adicionado!')
      setNovaData('')
      setNovoMotivo('')
      carregarDiasBloqueados()
    }
  }

  async function removerDiaBloqueado(id) {
    if (confirm('Remover este bloqueio?')) {
      const { error } = await supabase
        .from('dias_bloqueados')
        .delete()
        .eq('id', id)
      
      if (error) {
        alert('Erro: ' + error.message)
      } else {
        carregarDiasBloqueados()
      }
    }
  }

  async function adicionarTema() {
    if (!novoTema.trim()) {
      alert('Digite um tema')
      return
    }

    const { error } = await supabase
      .from('temas')
      .insert({ nome: novoTema.trim() })
    
    if (error) {
      alert('Erro: ' + error.message)
    } else {
      alert('Tema adicionado!')
      setNovoTema('')
      carregarTemas()
    }
  }

  async function removerTema(id, nome) {
    if (confirm(`Remover o tema "${nome}"?`)) {
      const { error } = await supabase
        .from('temas')
        .delete()
        .eq('id', id)
      
      if (error) {
        alert('Erro: ' + error.message)
      } else {
        carregarTemas()
      }
    }
  }

  function handleLogin(e) {
    e.preventDefault()
    if (senha === SENHA_ADMIN) {
      setAutenticado(true)
      localStorage.setItem('admin_autenticado', 'true')
      setErroSenha('')
      carregarAcervo()
      carregarDiasBloqueados()
      carregarTemas()
    } else {
      setErroSenha('Senha incorreta')
    }
  }

  function handleLogout() {
    setAutenticado(false)
    localStorage.removeItem('admin_autenticado')
    setSenha('')
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
            <Lock size={32} color="#1e3a5f" />
            <h2 style={{ margin: 0, color: '#1e3a5f' }}>Área Administrativa</h2>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Digite a senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '12px',
                boxSizing: 'border-box'
              }}
            />
            {erroSenha && <div style={{ color: '#dc2626', fontSize: '12px', marginBottom: '12px' }}>{erroSenha}</div>}
            <button
              type="submit"
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
              Entrar
            </button>
          </form>
        </div>
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
              <input
                type="text"
                placeholder="Título *"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
              />
              <input
                type="text"
                placeholder="Autores (separados por ;)"
                value={formData.autores}
                onChange={(e) => setFormData({ ...formData, autores: e.target.value })}
                style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
              />
              <input
                type="text"
                placeholder="Temáticas (separadas por ;)"
                value={formData.tematicas}
                onChange={(e) => setFormData({ ...formData, tematicas: e.target.value })}
                style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
              />
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '6px' }}
              >
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
                {formData.capa_preview && (
                  <div style={{ marginTop: '8px' }}>
                    <img src={formData.capa_preview} alt="Preview" style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                )}
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
                <input
                  type="text"
                  placeholder="Buscar item..."
                  value={buscaAcervo}
                  onChange={(e) => setBuscaAcervo(e.target.value)}
                  style={{ padding: '6px 12px', paddingLeft: '28px', border: '1px solid #ccc', borderRadius: '20px', fontSize: '12px', width: '180px' }}
                />
                <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                {buscaAcervo && (
                  <button
                    onClick={() => setBuscaAcervo('')}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#9ca3af' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            {loading && <div>Carregando...</div>}
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {itens
                .filter(item => 
                  buscaAcervo === '' || 
                  item.titulo.toLowerCase().includes(buscaAcervo.toLowerCase()) ||
                  (item.autores && item.autores.toLowerCase().includes(buscaAcervo.toLowerCase()))
                )
                .map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{item.titulo}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>{item.tipo === 'jogo' ? 'Jogo' : 'Livro'}</div>
                      {item.capa_url && <div style={{ fontSize: '10px', color: '#9ca3af' }}>Com capa</div>}
                    </div>
                    <div>
                      <button onClick={() => editarItem(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px', color: '#2563eb' }}><Edit size={18} /></button>
                      <button onClick={() => excluirItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              {buscaAcervo && itens.filter(i => i.titulo.toLowerCase().includes(buscaAcervo.toLowerCase())).length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>Nenhum item encontrado para "{buscaAcervo}"</div>
              )}
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
            <button onClick={adicionarDiaBloqueado} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Adicionar
            </button>
          </div>
          <div>
            <h3>Dias Bloqueados ({diasBloqueados.length})</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {diasBloqueados.map(dia => (
                <div key={dia.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
                  <div>
                    <div>{new Date(dia.data).toLocaleDateString('pt-BR')}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{dia.motivo}</div>
                  </div>
                  <button onClick={() => removerDiaBloqueado(dia.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}><Trash2 size={18} /></button>
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
            <button onClick={adicionarTema} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Adicionar Tema
            </button>
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
    </div>
  )
}

export default Admin