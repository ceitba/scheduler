import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import SearchBox from "./SearchBox"
import { useSubjects, type Subject } from "../hooks/useSubjects"
import SelectedCoursesList from "./SelectedCoursesList"
import AvailableCoursesList from "./AvailableCoursesList"
import LoadingDots from "./LoadingDots"
import ErrorView from "./ErrorView"
import { useParams } from "react-router-dom"
import BaseModal from "./BaseModal"

interface SelectedCourse extends Subject {
  selectedCommissions: string[]
  isPriority: boolean
}

interface CourseViewProps {
  selectedCourses: SelectedCourse[]
  onCommissionSelect: (course: Subject) => void
  onAddCourse: (course: Subject, commissions: string[]) => void
  onRemoveCourse: (courseId: string) => void
  onReorderCourses: (courses: SelectedCourse[]) => void
}

interface NoScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  subjectName: string
}

const NoScheduleModal: React.FC<NoScheduleModalProps> = ({
  isOpen,
  onClose,
  subjectName,
}) => {
  const { t } = useTranslation()
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={t('courses.noScheduleTitle')}>
      <div className="space-y-4">
        <p className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa]">
          {t('courses.noScheduleMessage', { name: subjectName })}
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 bg-primary text-surface font-body font-semibold text-body-sm rounded-sm hover:bg-primary-600 transition-colors duration-150"
          >
            {t('courses.understood')}
          </button>
        </div>
      </div>
    </BaseModal>
  )
}

const CourseView: React.FC<CourseViewProps> = ({
  selectedCourses,
  onCommissionSelect,
  onAddCourse,
  onRemoveCourse,
  onReorderCourses,
}) => {
  const { t } = useTranslation()
  const { subjects, loading, error } = useSubjects()
  const { career } = useParams()
  const isExchange = career === "X"
  const totalCredits = selectedCourses.reduce(
    (sum, course) => sum + course.credits,
    0
  )
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [showNoScheduleModal, setShowNoScheduleModal] = useState(false)
  const [currentSubject, setCurrentSubject] = useState<string>("")

  const subjectsByYear = isExchange
    ? {
        1: {
          year: t('courses.available'),
          subjects: { "1": subjects, "2": [] },
        },
      }
    : subjects.reduce(
        (acc, subject) => {
          const year = subject.year || 0
          if (!acc[year]) {
            acc[year] = {
              year: year === 0 ? t('courses.electives').toUpperCase() : `${year}${t('courses.year')}`,
              subjects: { "1": [], "2": [] },
            }
          }

          const quarter = subject.semester?.toString() || "1"
          if (quarter === "1" || quarter === "2") {
            acc[year].subjects[quarter]?.push(subject)
          } else {
            if (!acc[year].subjects[subject.section]) {
              acc[year].subjects[subject.section] = []
            }
            acc[year].subjects[subject.section].push(subject)
          }

          return acc
        },
        {} as Record<number, { year: string; subjects: { "1": Subject[]; "2": Subject[]; [category: string]: Subject[] } }>
      )

  const sortedSubjectsByYear = isExchange
    ? subjectsByYear
    : Object.entries(subjectsByYear)
        .sort(([yearA], [yearB]) => {
          const a = parseInt(yearA)
          const b = parseInt(yearB)
          if (a === 0) return 1
          if (b === 0) return -1
          return a - b
        })
        .reduce((acc, [year, data]) => {
          const displayYear = parseInt(year) === 0 ? 6 : parseInt(year)
          acc[displayYear] = data
          return acc
        }, {} as Record<number, (typeof subjectsByYear)[number]>)

  const handleSubjectSelect = (subject: Subject) => {
    const hasNoSchedules =
      !subject.commissions?.length ||
      subject.commissions.every((comm) => !comm.schedule?.length)

    if (hasNoSchedules) {
      setCurrentSubject(subject.name)
      setShowNoScheduleModal(true)
      return
    }

    if (selectedCourses.some((c) => c.subject_id === subject.subject_id)) {
      onRemoveCourse(subject.subject_id)
      return
    }

    const validCommissions = subject.commissions.filter(
      (comm) => comm.schedule?.length > 0
    )

    if (validCommissions.length === 1) {
      onAddCourse(subject, [validCommissions[0].name])
      return
    }

    onCommissionSelect(subject)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingDots size="lg" />
      </div>
    )
  }

  if (error) {
    return <ErrorView message={error} className="h-64" />
  }

  return (
    <div className="max-w-7xl mx-auto">
      <SearchBox subjects={subjects} onSelectSubject={handleSubjectSelect} />
      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-4 mt-4">
        <div>
          <div className="sticky top-[4.5rem] rounded-card p-4 bg-surface dark:bg-[#27272a] border border-border dark:border-[#3f3f46]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-body font-semibold text-body text-ink-primary dark:text-[#f4f4f5]">
                {t('courses.selected')}
              </h2>
              {totalCredits > 0 && (
                <div className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa]">
                  <span className="font-semibold">{totalCredits}</span> {t('courses.credits')}
                </div>
              )}
            </div>
            <SelectedCoursesList
              courses={selectedCourses}
              onRemove={onRemoveCourse}
              onReorder={onReorderCourses}
            />
          </div>
        </div>
        <div className="overflow-y-auto">
          <AvailableCoursesList
            courses={sortedSubjectsByYear}
            selectedCourses={selectedCourses}
            onCourseClick={handleSubjectSelect}
            isExchange={isExchange}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {selectedCourses.length > 0 && (
          <div className="bg-white dark:bg-[#27272a] border border-border dark:border-[#3f3f46] rounded-card mt-4">
            <button
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className="w-full flex items-center justify-between px-4 border-b border-border dark:border-[#3f3f46] h-20"
            >
              <div className="flex flex-col items-start justify-between w-full">
                <div className="font-body font-semibold text-body text-ink-primary dark:text-[#f4f4f5]">
                  {t('courses.selected')}
                </div>
                <div className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa]">
                  {selectedCourses.length} {selectedCourses.length !== 1 ? t('courses.courses') : t('courses.course')} · {totalCredits} {t('courses.credits')}
                </div>
              </div>
              <div>
                <svg
                  width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  className={`text-ink-secondary transition-transform duration-150 ${isPreviewOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>

            {isPreviewOpen && (
              <div className="border-b border-border p-3">
                <SelectedCoursesList
                  courses={selectedCourses}
                  onRemove={onRemoveCourse}
                  onReorder={onReorderCourses}
                />
              </div>
            )}
          </div>
        )}
        <div className="mt-4">
          <AvailableCoursesList
            courses={sortedSubjectsByYear}
            selectedCourses={selectedCourses}
            onCourseClick={handleSubjectSelect}
            isExchange={isExchange}
          />
        </div>
      </div>

      <NoScheduleModal
        isOpen={showNoScheduleModal}
        onClose={() => setShowNoScheduleModal(false)}
        subjectName={currentSubject}
      />
    </div>
  )
}

export default CourseView
