import magicBook from '../assets/magic-book.png';

interface BookCoverProps {
  src?: string;
  title: string;
  width: number;
  height: number;
}

export default function BookCover({ src, title, width, height }: BookCoverProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={title}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          objectFit: 'contain',
          borderRadius: '4px',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <img
      src={magicBook}
      alt={title}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        objectFit: 'contain',
        borderRadius: '4px',
        flexShrink: 0,
      }}
    />
  );
}
