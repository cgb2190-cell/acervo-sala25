import React, { useState } from 'react'
import {
  ArrowLeft, ChevronDown,
  BookOpen, Calendar, CheckCircle, Trophy, Tag,
  UserCog, CalendarX, Wrench, HelpCircle,
  Library, Info, Users
} from 'lucide-react'

// Imagem com fallback caso o arquivo não exista ainda
function ManualImg({ src, alt, caption }) {
  const [erro, setErro] = useState(false)
  if (erro) return null
  return (
    <div style={{ margin: '12px 0' }}>
      <img
        src={src}
        alt={alt}
        onError={() => setErro(true)}
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          display: 'block',
          margin: '0 auto'
        }}
      />
      {caption && (
        <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
          {caption}
        </p>
      )}
    </div>
  )
}

// Seção accordion individual
function Secao({ icon, titulo, children }) {
  const [aberto, setAberto] = useState(false)
  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      marginBottom: '10px',
      overflow: 'hidden',
      backgroundColor: 'white'
    }}>
      <button
        onClick={() => setAberto(!aberto)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            backgroundColor: '#EBF5FB',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            {icon}
          </div>
          <span style={{ fontWeight: '600', fontSize: '14px', color: '#1e3a5f' }}>
            {titulo}
          </span>
        </div>
        <ChevronDown
          size={18}
          color="#94a3b8"
          style={{ transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
        />
      </button>
      {aberto && (
        <div style={{
          padding: '4px 16px 16px',
          borderTop: '1px solid #f1f5f9',
          fontSize: '13px',
          color: '#334155',
          lineHeight: '1.7'
        }}>
          {children}
        </div>
      )}
    </div>
  )
}

// Bloco de passo numerado
function Passo({ num, texto }) {
  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
      <div style={{
        minWidth: '22px', height: '22px',
        backgroundColor: '#1e3a5f', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 'bold', color: 'white', marginTop: '1px'
      }}>
        {num}
      </div>
      <span dangerouslySetInnerHTML={{ __html: texto }} />
    </div>
  )
}

// Bloco de tópico com bullet
function Topico({ texto }) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
      <span style={{ color: '#1e3a5f', fontWeight: 'bold', marginTop: '1px' }}>•</span>
      <span dangerouslySetInnerHTML={{ __html: texto }} />
    </div>
  )
}

// Caixa de destaque
function Aviso({ cor, texto }) {
  const cores = {
    azul:     { bg: '#EBF5FB', borda: '#93c5fd' },
    verde:    { bg: '#f0fdf4', borda: '#86efac' },
    amarelo:  { bg: '#fefce8', borda: '#fde68a' },
    vermelho: { bg: '#fef2f2', borda: '#fca5a5' },
  }
  const c = cores[cor] || cores.azul
  return (
    <div style={{
      backgroundColor: c.bg,
      border: `1px solid ${c.borda}`,
      borderRadius: '8px',
      padding: '10px 14px',
      margin: '10px 0',
      fontSize: '12px',
      lineHeight: '1.6'
    }}
      dangerouslySetInnerHTML={{ __html: texto }}
    />
  )
}

// Legenda de cores da grade
function LegendaCores() {
  const items = [
    { cor: '#ffffff', texto: 'Disponível para reservar' },
    { cor: '#fff2cc', texto: 'Horário reservado' },
    { cor: '#d9ead3', texto: 'Todos os itens devolvidos' },
    { cor: '#e5e7eb', texto: 'Feriado ou recesso' },
  ]
  return (
    <div style={{ margin: '12px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
      {items.map(({ cor, texto }) => (
        <div key={cor} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px', height: '16px', borderRadius: '4px',
            backgroundColor: cor, border: '1px solid #d1d5db', flexShrink: 0
          }} />
          <span style={{ fontSize: '12px', color: '#475569' }}>{texto}</span>
        </div>
      ))}
    </div>
  )
}

function Ajuda({ onBack }) {
  const [tabAtiva, setTabAtiva] = useState('estagiarios')

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px' }}>
      {/* Cabeçalho */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#1e3a5f', marginBottom: '20px', fontSize: '14px'
        }}
      >
        <ArrowLeft size={18} /> Voltar
      </button>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <HelpCircle size={36} color="#1e3a5f" style={{ marginBottom: '8px' }} />
        <h1 style={{ color: '#1e3a5f', fontSize: '22px', marginBottom: '4px' }}>Ajuda</h1>
        <p style={{ color: '#64748b', fontSize: '13px' }}>
          Acervo Sala 25 — Manual do Sistema
        </p>
        <a
          href="https://acervo-sala25.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '12px', color: '#2563eb' }}
        >
          acervo-sala25.vercel.app
        </a>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'estagiarios', label: 'Para estagiários', icon: <Users size={14} /> },
          { id: 'admin', label: 'Para administradores', icon: <UserCog size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setTabAtiva(tab.id)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', padding: '10px 8px',
              backgroundColor: tabAtiva === tab.id ? '#1e3a5f' : '#f1f5f9',
              color: tabAtiva === tab.id ? 'white' : '#475569',
              border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontSize: '13px', fontWeight: tabAtiva === tab.id ? '600' : '400',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: ESTAGIÁRIOS */}
      {tabAtiva === 'estagiarios' && (
        <div>
          {/* 1. Acervo */}
          <Secao icon={<Library size={16} color="#1e3a5f" />} titulo="1. Acervo">
            <p style={{ marginBottom: '10px' }}>
              Página inicial do sistema. Exibe todos os livros e jogos disponíveis com capa, título, autor e temáticas.
            </p>
            <ManualImg src="/manual/acervo.png" alt="Tela do acervo" caption="Catálogo com busca e filtros" />
            <Topico texto="<strong>Busca</strong> — pesquise por título ou nome do autor" />
            <Topico texto="<strong>Filtros</strong> — botões Todos, Livros e Jogos" />
            <Topico texto="<strong>Clique no card</strong> — abre a tela de detalhes com capa ampliada, autores e temáticas completas" />
            <ManualImg src="/manual/detalhe.png" alt="Detalhe do item" caption="Tela de detalhes do item" />
          </Secao>

          {/* 2. Reservas */}
          <Secao icon={<Calendar size={16} color="#1e3a5f" />} titulo="2. Reservas">
            <p style={{ marginBottom: '10px' }}>
              Agendamento de empréstimos. É possível reservar com até 8 semanas de antecedência.
            </p>
            <ManualImg src="/manual/reservas.png" alt="Grade de reservas" caption="Grade semanal de horários" />
            <Passo num="1" texto="Selecione a semana desejada nos botões no topo" />
            <Passo num="2" texto="Clique no ícone de calendário em qualquer célula da grade" />
            <Passo num="3" texto="Preencha seu nome e selecione o item no dropdown" />
            <Passo num="4" texto="Confirme no modal de confirmação" />
            <ManualImg src="/manual/modal_reserva.png" alt="Modal de reserva" caption="Modal de nova reserva" />
            <ManualImg src="/manual/confirmar_reserva.png" alt="Confirmação de reserva" caption="Modal de confirmação — confira antes de finalizar" />
            <div style={{ margin: '12px 0 6px', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
              LEGENDA DE CORES DA GRADE
            </div>
            <LegendaCores />
            <Aviso cor="azul" texto="<strong>Dica:</strong> múltiplos itens podem ser reservados no mesmo horário. Cada um aparece empilhado na célula." />
            <ManualImg src="/manual/reserva_ok.png" alt="Reserva confirmada" caption="Reserva registrada — item aparece em amarelo na grade" />
            <ManualImg src="/manual/reserva_conflito.png" alt="Conflito de reserva" caption="Aviso de conflito — o mesmo item já está reservado neste horário" />
            <Aviso cor="amarelo" texto="<strong>Atenção:</strong> o alerta vermelho no rodapé indica reservas de semanas anteriores ainda não devolvidas." />
            <ManualImg src="/manual/alerta_pendente.png" alt="Alerta de pendências" caption="Alerta de devoluções pendentes" />
          </Secao>

          {/* 3. Devoluções */}
          <Secao icon={<CheckCircle size={16} color="#1e3a5f" />} titulo="3. Devoluções">
            <p style={{ marginBottom: '10px' }}>
              Registro de devolução em 3 passos para evitar erros na seleção.
            </p>
            <ManualImg src="/manual/devolucao.png" alt="Tela de devolução" caption="Seleção em cascata — recurso, data/horário e quem reservou" />
            <Passo num="1" texto="<strong>Selecione o recurso terapêutico</strong> no primeiro dropdown" />
            <Passo num="2" texto="<strong>Selecione a data e horário</strong> no segundo dropdown (aparecem apenas os horários com reserva ativa)" />
            <Passo num="3" texto="<strong>Selecione quem reservou</strong> no terceiro dropdown" />
            <p style={{ margin: '8px 0' }}>Confira o resumo exibido e clique em <strong>Registrar devolução</strong>.</p>
            <Aviso cor="verde" texto="Após a devolução, o item aparece com marcação de devolvido na grade. Quando todos os itens do horário forem devolvidos, a célula fica completamente verde." />
          </Secao>

          {/* 4. Ranking */}
          <Secao icon={<Trophy size={16} color="#1e3a5f" />} titulo="4. Ranking">
            <p style={{ marginBottom: '10px' }}>
              Lista os 20 livros e jogos mais reservados, com barras proporcionais ao número de reservas.
              Atualiza automaticamente conforme novas reservas são feitas.
            </p>
            <ManualImg src="/manual/ranking.png" alt="Ranking de uso" caption="Ranking — medalhas e barras de uso" />
            <Topico texto="1º lugar: medalha dourada" />
            <Topico texto="2º lugar: medalha prateada" />
            <Topico texto="3º lugar: medalha bronze" />
            <Topico texto="Demais posições: medalha cinza" />
            <Aviso cor="azul" texto="O ranking acumula dados ao longo do tempo. Quanto mais semanas de uso, mais representativo ele fica." />
          </Secao>

          {/* 5. Busca por Temáticas */}
          <Secao icon={<Tag size={16} color="#1e3a5f" />} titulo="5. Busca por Temáticas">
            <p style={{ marginBottom: '10px' }}>
              Encontre itens clicando diretamente nas temáticas, sem precisar digitar nada.
            </p>
            <ManualImg src="/manual/temas.png" alt="Busca por temáticas" caption="Chips clicáveis com resultado automático" />
            <Topico texto="<strong>Qualquer tema (OU)</strong> — itens que tenham pelo menos um dos temas selecionados" />
            <Topico texto="<strong>Todos os temas (E)</strong> — itens que tenham todos os temas simultaneamente" />
            <p style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
              Temas selecionados ficam em azul escuro. Clique em <em>Limpar seleção</em> para recomeçar.
            </p>
          </Secao>
        </div>
      )}

      {/* TAB: ADMINISTRADORES */}
      {tabAtiva === 'admin' && (
        <div>
          {/* Login */}
          <Secao icon={<UserCog size={16} color="#1e3a5f" />} titulo="Login — Área Administrativa">
            <p style={{ marginBottom: '10px' }}>
              Área restrita para gerenciar o acervo, temáticas e dias bloqueados.
            </p>
            <ManualImg src="/manual/login.png" alt="Tela de login" caption="Login com senha — ícone de olho para mostrar/ocultar" />
            <Passo num="1" texto='Clique em <strong>Login</strong> no menu superior' />
            <Passo num="2" texto="Digite a senha e clique no ícone de olho para mostrar/ocultar" />
            <Passo num="3" texto="Digite seu nome — será registrado em todas as alterações" />
            <Passo num="4" texto="Clique em <strong>Acessar</strong>" />
            <ManualImg src="/manual/identificacao.png" alt="Modal de identificação" caption="Modal de identificação do responsável" />
          </Secao>

          {/* Gerenciar acervo */}
          <Secao icon={<Library size={16} color="#1e3a5f" />} titulo="Gerenciar o acervo">
            <ManualImg src="/manual/admin_acervo.png" alt="Painel admin - acervo" caption="Painel de administração — aba Acervo" />
            <p style={{ marginBottom: '10px', fontWeight: '600' }}>Adicionar novo livro ou jogo:</p>
            <Passo num="1" texto="Preencha o título do item" />
            <Passo num="2" texto="Informe os autores separados por ponto-e-vírgula ( ; )" />
            <Passo num="3" texto="Informe as temáticas separadas por ponto-e-vírgula ( ; )" />
            <Passo num="4" texto="Selecione o tipo no dropdown (Livro Capa Dura, Livro Capa Mole ou Jogo)" />
            <Passo num="5" texto="Selecione a imagem da capa (opcional — máx. 5MB, JPG ou PNG)" />
            <Passo num="6" texto='Clique em <strong>Adicionar</strong>' />
            <ManualImg src="/manual/admin_form.png" alt="Formulário de novo item" caption="Formulário preenchido — pronto para adicionar" />
            <Aviso cor="azul" texto="Para <strong>editar</strong> um item existente, clique no ícone de lápis ao lado. Para <strong>excluir</strong>, clique no ícone de lixeira." />
          </Secao>

          {/* Dias bloqueados */}
          <Secao icon={<CalendarX size={16} color="#1e3a5f" />} titulo="Gerenciar dias bloqueados">
            <p style={{ marginBottom: '10px' }}>
              Feriados, greves e recessos bloqueiam o dia automaticamente — e devolvem todos os itens reservados para aquela data sem ação manual.
            </p>
            <ManualImg src="/manual/admin_bloqueados.png" alt="Dias bloqueados" caption="Aba Dias Bloqueados — adicionar e remover bloqueios" />
            <p style={{ fontWeight: '600', marginBottom: '8px' }}>Adicionar bloqueio:</p>
            <Passo num="1" texto="Vá para a aba <strong>Dias Bloqueados</strong>" />
            <Passo num="2" texto='Selecione a data e escreva o motivo (ex: "Feriado", "Greve", "Recesso")' />
            <Passo num="3" texto='Clique em <strong>Adicionar</strong>' />
            <Aviso cor="verde" texto="Ao bloquear um dia, todas as reservas daquela data são automaticamente encerradas e o histórico registra a devolução automática." />
            <p style={{ fontWeight: '600', marginBottom: '8px', marginTop: '12px' }}>Remover bloqueio:</p>
            <Passo num="1" texto="Localize o dia na lista e clique no ícone de lixeira" />
            <Passo num="2" texto="Confirme a exclusão" />
            <Aviso cor="amarelo" texto="<strong>Atenção:</strong> ao remover um bloqueio, as reservas anteriores <em>não</em> são restauradas automaticamente. Será necessário fazer novas reservas." />
          </Secao>

          {/* Gerenciar temas */}
          <Secao icon={<Tag size={16} color="#1e3a5f" />} titulo="Gerenciar temáticas">
            <ManualImg src="/manual/admin_temas.png" alt="Gerenciar temas" caption="Aba Temas — lista completa com opção de adicionar e remover" />
            <p style={{ fontWeight: '600', marginBottom: '8px' }}>Adicionar tema:</p>
            <Passo num="1" texto="Vá para a aba <strong>Temas</strong>" />
            <Passo num="2" texto="Digite o nome do novo tema no campo" />
            <Passo num="3" texto='Clique em <strong>Adicionar Tema</strong>' />
            <p style={{ fontWeight: '600', marginBottom: '8px', marginTop: '12px' }}>Remover tema:</p>
            <Topico texto="Clique no X ao lado do tema que deseja remover" />
            <Aviso cor="amarelo" texto="<strong>Atenção:</strong> ao remover ou renomear um tema, os itens que já tinham aquele tema associado precisam ser corrigidos manualmente." />
          </Secao>
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '24px' }}>
        Versão 2.0 — Abril/2026 — Sala 25 / SPA
      </p>
    </div>
  )
}

export default Ajuda
