import React from 'react'
import { Library, Calendar, CheckCircle, Trophy, Tag, UserStar, HelpCircle } from 'lucide-react'

function Menu({ active, onNavigate }) {
  const menuItems = [
    { id: 'catalog',    label: 'Acervo',     icon: <Library size={16} /> },
    { id: 'reservas',   label: 'Reservas',   icon: <Calendar size={16} /> },
    { id: 'devolucoes', label: 'Devoluções', icon: <CheckCircle size={16} /> },
    { id: 'ranking',    label: 'Ranking',    icon: <Trophy size={16} /> },
    { id: 'buscaTemas', label: 'Temas',      icon: <Tag size={16} /> },
    { id: 'ajuda',      label: 'Ajuda',      icon: <HelpCircle size={16} /> },
    { id: 'admin',      label: 'Login',      icon: <UserStar size={16} /> },
  ]

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      backgroundColor: '#1e3a5f',
      color: 'white',
      padding: '10px 12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 100,
      borderRadius: '0 0 12px 12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '16px',
      flexWrap: 'wrap',
      gap: '4px'
    }}>
      {menuItems.map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: active === item.id ? '#2c5a8c' : 'transparent',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: active === item.id ? 'bold' : 'normal',
            transition: 'background-color 0.2s',
            whiteSpace: 'nowrap'
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
