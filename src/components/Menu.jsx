import React from 'react'
import { BookOpen, Calendar, CheckCircle, Trophy, Tag, Settings } from 'lucide-react'

function Menu({ active, onNavigate }) {
  const menuItems = [
    { id: 'catalog', label: 'Acervo', icon: <BookOpen size={18} /> },
    { id: 'reservas', label: 'Reservas', icon: <Calendar size={18} /> },
    { id: 'devolucoes', label: 'Devoluções', icon: <CheckCircle size={18} /> },
    { id: 'ranking', label: 'Ranking', icon: <Trophy size={18} /> },
    { id: 'buscaTemas', label: 'Temas', icon: <Tag size={18} /> },
    { id: 'admin', label: 'Admin', icon: <Settings size={18} /> }
  ]

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      backgroundColor: '#1e3a5f',
      color: 'white',
      padding: '8px 8px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 100,
      borderRadius: '0 0 12px 12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '16px',
      flexWrap: 'wrap'
    }}>
      {menuItems.map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            backgroundColor: active === item.id ? '#2c5a8c' : 'transparent',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: active === item.id ? 'bold' : 'normal',
            transition: 'background-color 0.2s'
          }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default Menu