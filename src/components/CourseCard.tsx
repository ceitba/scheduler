import { type Subject } from "../hooks/useSubjects"

interface CourseCardProps {
  course: Subject
  isSelected: boolean
  onClick: () => void
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-3 rounded-card border cursor-pointer transition-shadow duration-200 group ${
        isSelected
          ? 'border-primary bg-primary-50 dark:bg-primary-900'
          : 'border-border dark:border-[#2D3748] bg-white dark:bg-[#1C2130] shadow-card hover:shadow-card-hover'
      }`}
    >
      <div className="flex flex-row space-x-2 min-w-0">
        <span className="font-mono text-label text-ink-secondary flex-shrink-0">
          ({course.subject_id})
        </span>
        <div className="flex flex-col min-w-0">
          <span className="font-body text-body-sm text-ink-primary truncate">
            {course.name}
          </span>
          <span className="font-mono text-label text-ink-secondary">
            {course.credits} créditos
          </span>
        </div>
      </div>

      <div className="flex-shrink-0 ml-2">
        {isSelected ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-red-400 group-hover:text-red-500 transition-colors" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink-secondary group-hover:text-primary transition-colors" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
      </div>
    </div>
  )
}

export default CourseCard
