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

        {/* Quick Add — hidden when menu open since the portaled X replaces it */}
        <button
          aria-label="Open quick add menu"
          onClick={() => setQuickAddOpen(true)}
          style={{
            background: '#2563eb',
            border: 'none',
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: quickAddOpen ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 700,
            color: 'white',
            cursor: 'pointer',
            marginTop: -14,
            boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
          }}
        >
          +
        </button>
        {/* Spacer to keep nav layout when button is hidden */}
        {quickAddOpen && <div style={{ width: 48, height: 48, marginTop: -14 }} />}

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
