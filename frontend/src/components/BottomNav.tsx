import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import QuickAddMenu from './QuickAddMenu';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const isHome = location.pathname === '/';
  const isSettings = location.pathname === '/settings';

  return (
    <>
      {quickAddOpen && <QuickAddMenu onClose={() => setQuickAddOpen(false)} />}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--nav-bg)',
        borderTop: '1px solid var(--nav-border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '10px 0 env(safe-area-inset-bottom, 18px)',
        zIndex: 100,
      }}>
        {/* Home */}
        <button
          aria-label="Home"
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'center',
            padding: '4px 12px',
          }}
        >
          <div style={{ fontSize: 20 }}>🏠</div>
          <div style={{ fontSize: 9, color: isHome ? 'var(--primary)' : 'var(--text-secondary)', marginTop: 2 }}>Home</div>
        </button>

        {/* Quick Add */}
        <button
          aria-label="Open quick add menu"
          onClick={() => setQuickAddOpen(!quickAddOpen)}
          style={{
            background: quickAddOpen ? '#ef4444' : '#2563eb',
            border: 'none',
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 700,
            color: 'white',
            cursor: 'pointer',
            marginTop: -14,
            boxShadow: quickAddOpen
              ? '0 4px 16px rgba(239,68,68,0.4)'
              : '0 4px 12px rgba(37,99,235,0.4)',
            transform: quickAddOpen ? 'rotate(45deg) scale(1)' : 'scale(1)',
            transition: 'all 0.2s ease',
          }}
        >
          +
        </button>

        {/* Settings */}
        <button
          aria-label="Settings"
          onClick={() => navigate('/settings')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'center',
            padding: '4px 12px',
          }}
        >
          <div style={{ fontSize: 20 }}>⚙️</div>
          <div style={{ fontSize: 9, color: isSettings ? 'var(--primary)' : 'var(--text-secondary)', marginTop: 2 }}>Settings</div>
        </button>
      </nav>
    </>
  );
}
