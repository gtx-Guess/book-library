interface QuickAddMenuProps {
  onClose: () => void;
}

export default function QuickAddMenu({ onClose }: QuickAddMenuProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 999,
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
