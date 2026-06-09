interface AvatarProps {
  name: string
  src?: string
  size?: number
}

export function Avatar({ name, src, size = 36 }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
  return (
    <span
      className="inline-grid place-items-center rounded-full overflow-hidden font-display font-bold text-onAccent shrink-0 select-none"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, var(--navy-700), var(--teal-600))',
        fontSize: size * 0.4,
      }}
    >
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials}
    </span>
  )
}
