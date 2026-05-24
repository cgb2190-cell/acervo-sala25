// src/components/RichEditor.jsx
import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import UnderlineExt from '@tiptap/extension-underline'
import { Bold, Italic, Underline, Undo2, Redo2, RotateCcw } from 'lucide-react'

function RichEditor({ value, onChange, placeholder = '' }) {
  const originalRef = useRef(value || '')
  const [alterado, setAlterado] = useState(false)

  // Converte texto puro para HTML se necessário
  function toHtml(val) {
    if (!val) return ''
    const str = String(val)
    // Se já tem tags HTML, usa como está
    if (/<[a-z][\s\S]*>/i.test(str)) return str
    // Converte texto puro: quebras de linha viram parágrafos
    return str
      .split(/\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `<p>${line}</p>`)
      .join('')
  }

  const editor = useEditor({
    extensions: [
      UnderlineExt,
      StarterKit.configure({
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
        heading: false,
      }),
    ],
    content: toHtml(value),
    onUpdate({ editor }) {
      const html = editor.getHTML()
      onChange(html)
      setAlterado(html !== originalRef.current)
    },
  })

  // Atualiza conteúdo quando o item editado muda
  useEffect(() => {
    if (editor && toHtml(value) !== editor.getHTML()) {
      editor.commands.setContent(toHtml(value))
      originalRef.current = value || ''
      setAlterado(false)
    }
  }, [value, editor])

  function descartar() {
    editor.commands.setContent(originalRef.current)
    onChange(originalRef.current)
    setAlterado(false)
  }

  const btn = (onClick, title, children, active = false) => (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      style={{
        width: 28, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: active ? '#dbeafe' : 'transparent',
        color: active ? '#1e3a5f' : '#374151',
      }}
    >
      {children}
    </button>
  )

  return (
    <div style={{
      border: `1px solid ${alterado ? '#93c5fd' : '#ccc'}`,
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: 8,
      transition: 'border-color 0.2s',
    }}>
      {/* Barra de ferramentas */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 8px', borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb', flexWrap: 'wrap', gap: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {btn(() => editor.chain().focus().toggleBold().run(), 'Negrito',
            <Bold size={14} />, editor?.isActive('bold'))}
          {btn(() => editor.chain().focus().toggleItalic().run(), 'Itálico',
            <Italic size={14} />, editor?.isActive('italic'))}
          {btn(() => editor.chain().focus().toggleUnderline().run(), 'Sublinhado',
            <Underline size={14} />, editor?.isActive('underline'))}

          <div style={{ width: 1, height: 18, background: '#e5e7eb', margin: '0 4px' }} />

          {btn(() => editor.chain().focus().undo().run(), 'Desfazer', <Undo2 size={14} />)}
          {btn(() => editor.chain().focus().redo().run(), 'Refazer', <Redo2 size={14} />)}
        </div>

        {alterado && (
          <button
            type="button"
            onClick={descartar}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: '#6b7280', padding: '3px 8px',
              border: '1px solid #e5e7eb', borderRadius: 4,
              backgroundColor: 'white', cursor: 'pointer',
            }}
          >
            <RotateCcw size={11} />
            Descartar alterações
          </button>
        )}
      </div>

      {/* Área de edição */}
      <EditorContent
        editor={editor}
        style={{ padding: '10px 12px', minHeight: 120, fontSize: 14, lineHeight: 1.7 }}
      />

      {alterado && (
        <div style={{
          fontSize: 11, color: '#6b7280', padding: '4px 12px',
          borderTop: '1px solid #f3f4f6', backgroundColor: '#f9fafb',
        }}>
          Alterações não salvas
        </div>
      )}
    </div>
  )
}

export default RichEditor
