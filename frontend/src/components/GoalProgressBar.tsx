// frontend/src/components/GoalProgressBar.tsx

interface GoalProgressBarProps {
  booksRead: number;
  goalCount: number;
  compact?: boolean;
}

export default function GoalProgressBar({ booksRead, goalCount, compact }: GoalProgressBarProps) {
  const progress = goalCount > 0 ? Math.round((booksRead / goalCount) * 100) : 0;
  const clampedProgress = Math.min(progress, 100);

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
          {booksRead} / {goalCount}
        </span>
        <div style={{
          flex: 1,
          background: 'var(--border)',
          borderRadius: 99,
          height: 4,
          overflow: 'hidden',
          minWidth: 40,
        }}>
          <div style={{
            background: 'var(--primary)',
            height: '100%',
            width: `${clampedProgress}%`,
            borderRadius: 99,
            transition: 'width 0.3s',
          }} />
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          {progress}%
        </span>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>
        {booksRead}
        <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 400 }}> / {goalCount}</span>
      </div>
      <div style={{
        background: 'var(--border)',
        borderRadius: 99,
        height: 6,
        overflow: 'hidden',
        marginTop: 6,
      }}>
        <div style={{
          background: 'var(--primary)',
          height: '100%',
          width: `${clampedProgress}%`,
          borderRadius: 99,
          transition: 'width 0.3s',
        }} />
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 3 }}>
        {progress}% complete
      </div>
    </div>
  );
}
