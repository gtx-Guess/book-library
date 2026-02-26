interface RatingDisplayProps {
  rating: number;
}

export default function RatingDisplay({ rating }: RatingDisplayProps) {
  // Calculate stars (out of 5)
  const fullStars = Math.floor(rating / 2);
  const hasHalfStar = rating % 2 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`full-${i}`} style={{ color: '#FFD700', fontSize: '1rem' }}>
            ★
          </span>
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <span style={{ color: '#FFD700', fontSize: '1rem' }}>
            ★
          </span>
        )}
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`empty-${i}`} style={{ color: '#ddd', fontSize: '1rem' }}>
            ★
          </span>
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
