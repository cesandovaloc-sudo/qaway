export function ResponsiveImage({
  image,
  alt,
  className = "",
  sizes = "100vw",
  loading = "lazy",
  ...props
}) {
  return (
    <picture className={className}>
      <source srcSet={image.srcSet("avif")} sizes={sizes} type="image/avif" />
      <source srcSet={image.srcSet("webp")} sizes={sizes} type="image/webp" />
      <img
        alt={alt}
        decoding="async"
        height={image.height}
        loading={loading}
        src={image.fallback}
        width={image.width}
        {...props}
      />
    </picture>
  );
}
