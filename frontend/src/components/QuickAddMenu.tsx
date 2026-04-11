import { useEffect } from 'react';

interface QuickAddMenuProps {
  onClose: () => void;
}

export default function QuickAddMenu({ onClose }: QuickAddMenuProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 18,
      }}
    >
      Quick Add (coming soon)
    </div>
  );
}
