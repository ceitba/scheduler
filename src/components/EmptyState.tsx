interface EmptyStateProps {
  title: string
  message: string
}

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center animate-fade-in">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full bg-primary-50 dark:bg-primary-900" />
        <div className="absolute top-3 left-3 w-10 h-10 rotate-45 bg-accent-100 dark:bg-accent-900" />
        <div className="absolute bottom-4 right-3 w-6 h-6 rounded-full bg-primary-200 dark:bg-primary-800" />
      </div>
      <p className="font-display text-h4 font-bold text-ink-primary dark:text-[#F0F2F5]">{title}</p>
      <p className="font-body text-body text-ink-secondary dark:text-[#9BA3AF] mt-1">{message}</p>
    </div>
  )
}
