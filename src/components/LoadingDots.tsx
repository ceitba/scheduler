interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export default function LoadingDots({ size = 'md' }: LoadingDotsProps) {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2'
  return (
    <div className="flex items-center gap-1.5" aria-label="Cargando" role="status">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`${dotSize} rounded-full bg-primary animate-pulse`}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  )
}
