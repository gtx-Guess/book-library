import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface QuickAddMenuProps {
  onClose: () => void;
}

const menuItems = [
  { emoji: '✅', bg: '#064e3b', border: '#10b981', path: '/add', label: 'Mark as Finished' },
  { emoji: '📖', bg: '#1e3a5f', border: '#3b82f6', path: '/add-currently-reading', label: 'Currently Reading' },
  { emoji: '📋', bg: '#78350f', border: '#f59e0b', path: '/add-want-to-read', label: 'Want to Read' },
  { emoji: '📕', bg: '#7f1d1d', border: '#ef4444', path: '/add-dnf', label: 'DNF' },
];

const radialPositions = [
  { x: -80, y: -110 },  // top-left (finished)
  { x: 80, y: -110 },   // top-right (reading)
  { x: -110, y: -40 },  // left (want to read)
  { x: 110, y: -40 },   // right (dnf)
];

export default function QuickAddMenu({ onClose }: QuickAddMenuProps) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSelect = (path: string) => {
    setVisible(false);
    setTimeout(() => {
      navigate(path);
      onClose();
    }, 150);
  };

  return (
    <>
      {/* Blur scrim — covers everything */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--scrim)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 200,
        }}
      />

      {/* Icon bubbles */}
      {menuItems.map((item, i) => (
        <button
          key={item.path}
          onClick={(e) => {
            e.stopPropagation();
            handleSelect(item.path);
          }}
          aria-label={item.label}
          title={item.label}
          style={{
            position: 'fixed',
            bottom: `calc(60px + ${visible ? -radialPositions[i].y : 0}px)`,
            left: `calc(50% + ${visible ? radialPositions[i].x : 0}px - 28px)`,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: item.bg,
            border: `2px solid ${item.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(0,0,0,0.6)',
            transform: visible ? 'scale(1)' : 'scale(0)',
            opacity: visible ? 1 : 0,
            transition: `all 0.2s ease-out ${i * 0.03}s`,
            zIndex: 201,
            padding: 0,
          }}
        >
          {item.emoji}
        </button>
      ))}

      {/* X close button — portaled to document.body to escape all stacking contexts */}
      {createPortal(
        <button
          aria-label="Close quick add menu"
          onClick={onClose}
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 18px) + 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#ef4444',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 700,
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(239,68,68,0.4)',
            zIndex: 9999,
          }}
        >
          ✕
        </button>,
        document.body
      )}
    </>
  );
}
