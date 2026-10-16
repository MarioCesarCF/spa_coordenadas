export default function Logo({ sx, src = '/logos/logo_sylven-sf.png', alt = 'Sylven' }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        display: 'block',
        height: 36,
        width: 'auto',
        ...sx,
      }}
    />
  )
}
