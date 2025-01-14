import React, { useState } from "react";
import SearchBox from "./SearchBox";
import { useSubjects, type Subject } from "../hooks/useSubjects";
import SelectedCoursesList from "./SelectedCoursesList";
import AvailableCoursesList from "./AvailableCoursesList";
import LoadingDots from "./LoadingDots";
import ErrorView from "./ErrorView";
import { useParams } from "next/navigation";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import BaseModal from "./BaseModal";

interface SelectedCourse extends Subject {
  selectedCommissions: string[];
  isPriority: boolean;
}

interface CourseViewProps {
  selectedCourses: SelectedCourse[];
  onCommissionSelect: (course: Subject) => void;
  onAddCourse: (course: Subject, commissions: string[]) => void;
  onRemoveCourse: (courseId: string) => void;
  onReorderCourses: (courses: SelectedCourse[]) => void;
}

interface NoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectName: string;
}

const NoScheduleModal: React.FC<NoScheduleModalProps> = ({
  isOpen,
  onClose,
  subjectName,
}) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Materia sin horarios">
      <div className="space-y-4">
        <p className="text-sm text-gray">
          La materia{" "}
          <span className="font-medium text-textDefault">{subjectName}</span> no
          tiene horarios o comisiones disponibles actualmente.
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Entendido
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

const CourseView: React.FC<CourseViewProps> = ({
  selectedCourses,
  onCommissionSelect,
  onAddCourse,
  onRemoveCourse,
  onReorderCourses,
}) => {
  const { subjects, loading, error } = useSubjects();
  const { career } = useParams();
  const isExchange = career === "X";
  const totalCredits = selectedCourses.reduce(
    (sum, course) => sum + course.credits,
    0
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showNoScheduleModal, setShowNoScheduleModal] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<string>("");

  // For exchanges, we'll show all subjects in a flat list
  const subjectsByYear = isExchange
    ? {
        1: {
          year: "Materias Disponibles",
          subjects: {
            "1": subjects,
            "2": [],
          },
        },
      }
    : subjects.reduce(
        (acc, subject) => {
          const year = subject.year || 0;
          if (!acc[year]) {
            acc[year] = {
              year: year === 0 ? "ELECTIVAS" : `${year}° Año`,
              subjects: {
                "1": [],
                "2": [],
              },
            };
          }

          // Add subject to appropriate quarter or category
          const quarter = subject.semester?.toString() || "1";
          if (quarter === "1" || quarter === "2") {
            acc[year].subjects[quarter]?.push(subject);
          } else {
            if (!acc[year].subjects[subject.section]) {
              acc[year].subjects[subject.section] = [];
            }
            acc[year].subjects[subject.section].push(subject);
          }
          // console.log(acc);

          return acc;
        },
        {} as Record<
          number,
          {
            year: string;
            subjects: {
              "1": Subject[];
              "2": Subject[];
              [category: string]: Subject[];
            };
          }
        >
      );

  // Sort years (ELECTIVAS at the bottom) - only for non-exchange careers
  const sortedSubjectsByYear = isExchange
    ? subjectsByYear
    : Object.entries(subjectsByYear)
        .sort(([yearA], [yearB]) => {
          const a = parseInt(yearA);
          const b = parseInt(yearB);
          if (a === 0) return 1;
          if (b === 0) return -1;
          return a - b;
        })
        .reduce((acc, [year, data]) => {
          const displayYear = parseInt(year) === 0 ? 6 : parseInt(year);
          acc[displayYear] = data;
          return acc;
        }, {} as Record<number, (typeof subjectsByYear)[number]>);

  const handleSubjectSelect = (subject: Subject) => {
    // Check if subject has no commissions or all commissions have empty schedules
    const hasNoSchedules =
      !subject.commissions?.length ||
      subject.commissions.every((comm) => !comm.schedule?.length);

    if (hasNoSchedules) {
      setCurrentSubject(subject.name);
      setShowNoScheduleModal(true);
      return;
    }

    if (selectedCourses.some((c) => c.subject_id === subject.subject_id)) {
      onRemoveCourse(subject.subject_id);
      return;
    }

    // Only consider commissions with valid schedules
    const validCommissions = subject.commissions.filter(
      (comm) => comm.schedule?.length > 0
    );

    if (validCommissions.length === 1) {
      onAddCourse(subject, [validCommissions[0].name]);
      return;
    }

    onCommissionSelect(subject);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingDots size="lg" color="bg-primary" />
      </div>
    );
  }

  if (error) {
    return <ErrorView message={error} className="h-64" />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <SearchBox subjects={subjects} onSelectSubject={handleSubjectSelect} />
      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-4 mt-4">
        <div>
          <div className="sticky top-[3.5rem] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-textDefault">
                Cursos seleccionados
              </h2>
              {totalCredits > 0 && (
                <div className="text-sm text-gray">
                  <span className="font-medium">{totalCredits}</span> créditos
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
          <div className="bg-background">
            <button
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className="w-full flex items-center justify-between px-4 border-b border-surface h-20"
            >
              <div className="flex flex-col items-start justify-between w-full">
                <div className="font-semibold text-lg">
                  Cursos seleccionados
                </div>
                <div className="text-sm text-gray font-medium">
                  {selectedCourses.length} curso
                  {selectedCourses.length !== 1 ? "s" : ""} · {totalCredits}{" "}
                  créditos
                </div>
              </div>
              <div>
                {isPreviewOpen ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray" />
                )}
              </div>
            </button>

            {isPreviewOpen && (
              <div className="border-b border-surface p-2">
                <SelectedCoursesList
                  courses={selectedCourses}
                  onRemove={onRemoveCourse}
                  onReorder={onReorderCourses}
                />
              </div>
            )}
          </div>
        )}
        <div>
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
  );
};

export default CourseView;
