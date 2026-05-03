import { type Subject } from "../hooks/useSubjects"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useTranslation } from 'react-i18next'

interface SelectedCourse extends Subject {
  selectedCommissions: string[]
  isPriority: boolean
}

interface SortableItemProps {
  course: SelectedCourse
  onRemove: (id: string) => void
}

interface GroupedSchedule {
  day: string
  timeFrom: string
  timeTo: string
  classrooms: string[]
}

const SortableItem = ({ course, onRemove }: SortableItemProps) => {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: course.subject_id })

  const orderedSelectedCommissions = course.selectedCommissions.slice().sort()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const groupedSchedule = course.selectedCommissions.includes('any') || course.selectedCommissions.length > 1
    ? {}
    : course.commissions
        .filter(c => course.selectedCommissions.includes(c.name))
        .reduce((acc, commission) => {
          commission.schedule?.forEach(schedule => {
            const key = `${schedule.day}-${schedule.time_from}-${schedule.time_to}`
            if (!acc[key]) {
              acc[key] = {
                day: schedule.day,
                timeFrom: schedule.time_from,
                timeTo: schedule.time_to,
                classrooms: [schedule.classroom],
              }
            } else if (!acc[key].classrooms.includes(schedule.classroom)) {
              acc[key].classrooms.push(schedule.classroom)
            }
          })
          return acc
        }, {} as Record<string, GroupedSchedule>)

  const allCommissionsSelected = course.selectedCommissions.length === course.commissions.length

  const commissionLabel = () => {
    if (course.selectedCommissions.includes("any") || allCommissionsSelected)
      return t('courses.anyCommission')
    if (course.selectedCommissions.length === 1)
      return `${t('courses.commissionAbbr')} ${course.selectedCommissions[0].toUpperCase()}`
    if (course.selectedCommissions.length === 2)
      return `${t('courses.commissionAbbr')} ${orderedSelectedCommissions[0].toUpperCase()} o ${orderedSelectedCommissions[1].toUpperCase()}`
    return `${t('courses.commissionAbbr')} ${orderedSelectedCommissions.slice(0, -1).map(c => c.toUpperCase()).join(", ")}, o ${orderedSelectedCommissions[orderedSelectedCommissions.length - 1].toUpperCase()}`
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col p-3 bg-white dark:bg-[#27272a] rounded-card border border-border dark:border-[#3f3f46] shadow-card space-y-2 select-none"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <div
            className="cursor-grab active:cursor-grabbing flex-shrink-0"
            {...attributes}
            {...listeners}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink-secondary dark:text-[#a1a1aa]" aria-hidden="true">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="font-body text-body-sm text-ink-primary dark:text-[#f4f4f5]">
              <span className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa]">({course.subject_id})</span>{' '}
              {course.name}
            </span>
            {Object.values(groupedSchedule).map((schedule, i) => (
              <div key={i} className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa]">
                {t(`days.${schedule.day}`)} {schedule.timeFrom?.slice(0, 5) || ""}{" "}
                - {schedule.timeTo?.slice(0, 5) || ""} |{" "}
                {schedule.classrooms.join(", ")}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4 flex-shrink-0 ml-2">
          <span className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa] text-end hidden sm:block">
            {commissionLabel()}
          </span>
          <button
            onClick={() => onRemove(course.subject_id)}
            className="text-ink-secondary dark:text-[#a1a1aa] hover:text-red-500 transition-colors duration-150"
            aria-label={`Eliminar ${course.name}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

interface SelectedCoursesListProps {
  courses: SelectedCourse[]
  onRemove: (courseId: string) => void
  onReorder: (courses: SelectedCourse[]) => void
}

const SelectedCoursesList: React.FC<SelectedCoursesListProps> = ({
  courses,
  onRemove,
  onReorder,
}) => {
  const { t } = useTranslation()
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = courses.findIndex(
        (course) => course.subject_id === active.id
      )
      const newIndex = courses.findIndex(
        (course) => course.subject_id === over.id
      )
      onReorder(arrayMove(courses, oldIndex, newIndex))
    }
  }

  return (
    <div>
      {courses.length === 0 && (
        <div className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa] text-center py-4">
          {t('courses.noneSelected')}
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={courses.map((c) => c.subject_id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {courses.map((course) => (
              <SortableItem
                key={course.subject_id}
                course={course}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default SelectedCoursesList
