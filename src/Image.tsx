interface ImageProps {
  image?: string;
  alt?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export const Image = ({ image, alt = '', onClick, clickable = false }: ImageProps) => {
  if (!image) return null;

  const hoverable = typeof onClick === 'function';
  const style = hoverable ? { cursor: clickable ? 'pointer' : 'not-allowed' } : undefined;
  const source = image.startsWith('http') ? image : `data:image/jpeg;base64, ${image}`;

  return (
    <img
      alt={alt}
      style={style}
      src={source}
      onClick={clickable ? onClick : undefined}
    />
  );
};
