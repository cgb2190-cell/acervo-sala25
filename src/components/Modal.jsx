import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

function Modal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  showInput = false,
  inputPlaceholder = '',
  inputValue = '',
  onInputChange = null,
  type = 'confirm'
}) {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      onClose()
    }
  }

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {message && (
            <p style={{ margin: '0 0 16px 0', color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>
              {message}
            </p>
          )}
          
          {showInput && (
            <input
              type="text"
              placeholder={inputPlaceholder}
              value={inputValue}
              onChange={(e) => onInputChange && onInputChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '16px 20px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '8px 16px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '8px 16px',
              backgroundColor: type === 'confirm' ? '#1e3a5f' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal