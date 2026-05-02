export default function SkeletonCard() {
  return (
    <div
      className="rounded-card border border-border dark:border-[#2D3748] bg-white dark:bg-[#1C2130] overflow-hidden shadow-card animate-fade-in"
      aria-busy="true"
      aria-hidden="true"
    >
      <div className="h-44 skeleton" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 w-16 rounded-sm skeleton" />
        <div className="h-6 w-3/4 rounded-sm skeleton" />
        <div className="h-4 w-full rounded-sm skeleton" />
        <div className="h-4 w-2/3 rounded-sm skeleton" />
        <div className="flex items-center gap-3 pt-2 border-t border-border dark:border-[#2D3748] mt-2">
          <div className="h-3 w-24 rounded-sm skeleton" />
          <div className="h-3 w-16 rounded-sm skeleton" />
        </div>
      </div>
    </div>
  )
}
