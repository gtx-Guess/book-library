interface RatingDisplayProps {
  rating: number;
}

export default function RatingDisplay({ rating }: RatingDisplayProps) {
  const fullStars = Math.floor(rating / 2);
  const hasHalfStar = rating % 2 > 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`full-${i}`} style={{ color: '#FFD700', fontSize: '1rem', lineHeight: 1 }}>★</span>
        ))}

        {hasHalfStar && (
          <span style={{ position: 'relative', display: 'inline-block', fontSize: '1rem', lineHeight: 1 }}>
            <span style={{ color: '#3a3a5a' }}>★</span>
            <span style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '50%',
              overflow: 'hidden',
              color: '#FFD700',
            }}>★</span>
          </span>
        )}

        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`empty-${i}`} style={{ color: '#3a3a5a', fontSize: '1rem', lineHeight: 1 }}>★</span>
        ))}
      </div>

      <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
        {rating}
      </span>
      <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
        / 10
      </span>
    </div>
  );
}
