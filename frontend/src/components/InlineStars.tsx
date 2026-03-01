export default function InlineStars({ rating }: { rating: number | undefined }) {
  const value = rating ?? 0;
  const fullStars = Math.floor(value / 2);
  const hasHalf = value % 2 > 0;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  return (
    <div style={{ display: 'flex', gap: '0.1rem' }}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={`f${i}`} style={{ color: '#FFD700', fontSize: '1rem', lineHeight: 1 }}>★</span>
      ))}
      {hasHalf && (
        <span style={{ position: 'relative', display: 'inline-block', fontSize: '1rem', lineHeight: 1 }}>
          <span style={{ color: '#3a3a5a' }}>★</span>
          <span style={{ position: 'absolute', left: 0, top: 0, width: '50%', overflow: 'hidden', color: '#FFD700' }}>★</span>
        </span>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span key={`e${i}`} style={{ color: '#3a3a5a', fontSize: '1rem', lineHeight: 1 }}>★</span>
      ))}
    </div>
  );
}
