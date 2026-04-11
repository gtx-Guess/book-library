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
      {/* Full-width backdrop behind the nav */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        background: 'var(--background)',
        zIndex: 99,
      }} />
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 600,
        background: 'var(--nav-bg)',
        borderTop: '1px solid var(--nav-border)',
        borderLeft: '1px solid var(--nav-border)',
        borderRight: '1px solid var(--nav-border)',
        borderRadius: '16px 16px 0 0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '10px 0 env(safe-area-inset-bottom, 18px)',
        zIndex: 100,
        boxShadow: '0 -2px 10px var(--shadow)',
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
          aria-label={quickAddOpen ? 'Close quick add menu' : 'Open quick add menu'}
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
            fontSize: quickAddOpen ? 20 : 24,
            fontWeight: 700,
            color: 'white',
            cursor: 'pointer',
            marginTop: -14,
            boxShadow: quickAddOpen
              ? '0 4px 16px rgba(239,68,68,0.4)'
              : '0 4px 12px rgba(37,99,235,0.4)',
            transition: 'all 0.2s ease',
            position: 'relative',
            zIndex: quickAddOpen ? 250 : 'auto',
          }}
        >
          {quickAddOpen ? '✕' : '+'}
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
