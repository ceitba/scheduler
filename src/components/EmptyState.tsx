interface EmptyStateProps {
  title: string
  message: string
}

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center animate-fade-in">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full bg-primary-50" />
        <div className="absolute top-3 left-3 w-10 h-10 rotate-45 bg-accent-100" />
        <div className="absolute bottom-4 right-3 w-6 h-6 rounded-full bg-primary-200" />
      </div>
      <p className="font-display text-h4 font-bold text-ink-primary">{title}</p>
      <p className="font-body text-body text-ink-secondary mt-1">{message}</p>
    </div>
  )
}
