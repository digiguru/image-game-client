interface ImageProps {
  image?: string;
  alt?: string;
}

export const Image = ({ image, alt = '' }: ImageProps) => {
  if (!image) return null;

  const source = image.startsWith('http') ? image : `data:image/jpeg;base64, ${image}`;
  return <img alt={alt} src={source} />;
};
