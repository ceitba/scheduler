import React, { useState } from "react";
import SearchBox from "./SearchBox";
import {
  TrashIcon,
  Bars3Icon,
  PlusIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import TooltipHeader from "./Tooltip";
import DropdownSection from "./DropdownSection";
import { useSubjects, type Subject } from "../hooks/useSubjects";

interface SelectedCourse extends Subject {
  selectedCommission: string;
  isPriority: boolean;
}

interface CourseViewProps {
  selectedCourses: SelectedCourse[];
  onCommissionSelect: (course: Subject) => void;
  onAddCourse: (course: Subject, commission: { id: string; name: string }) => void;
  onRemoveCourse: (courseId: string) => void;
}

const CourseView: React.FC<CourseViewProps> = ({ 
  selectedCourses, 
  onCommissionSelect, 
  onAddCourse,
  onRemoveCourse 
}) => {
  const { subjects, loading, error } = useSubjects();

  // Group subjects by year
  const subjectsByYear = subjects.reduce((acc, subject) => {
    const year = subject.year;
    if (!acc[year]) {
      acc[year] = {
        year: `${year}° Año`,
        subjects: []
      };
    }
    acc[year].subjects.push(subject);
    return acc;
  }, {} as Record<number, { year: string; subjects: Subject[] }>);

  const handleAddCourseClick = (course: Subject) => {
    // If the course is already selected, just remove it
    if (selectedCourses.some(c => c.id === course.id)) {
      onRemoveCourse(course.id);
      return;
    }

    // If the course has only one commission, add it directly
    if (course.commissions.length === 1) {
      onAddCourse(course, course.commissions[0]);
      return;
    }

    // Otherwise, trigger modal at page level
    onCommissionSelect(course);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="mx-0 relative">
      <SearchBox />
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selected Courses Section */}
        <div className="bg-secondaryBackground/30 rounded-xl p-4">
          <TooltipHeader
            title="Cursos Seleccionados"
            tooltip="Arrastra las materias para ordenarlas según prioridad"
            className="mb-4"
          />
          <div className="space-y-2">
            {selectedCourses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col p-3 bg-secondaryBackground rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bars3Icon className="h-5 w-5 text-gray" />
                    <span className="text-textDefault">{course.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray">
                      {course.selectedCommission === 'any' 
                        ? 'Cualquier comisión' 
                        : `Comisión ${course.selectedCommission.toUpperCase()}`}
                    </span>
                    <button
                      onClick={() => onRemoveCourse(course.id)}
                      className="text-gray hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {selectedCourses.length === 0 && (
              <div className="text-gray text-center py-8">
                No tiene cursos seleccionados
              </div>
            )}
          </div>
        </div>

        {/* Available Courses Section */}
        <div className="bg-secondaryBackground/30 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-textDefault mb-4">
            Cursos Disponibles
          </h2>
          <div className="space-y-4">
            {Object.values(subjectsByYear).map((yearData) => (
              <DropdownSection key={yearData.year} title={yearData.year}>
                <div className="space-y-2">
                  {yearData.subjects.map((course) => {
                    const isSelected = selectedCourses.some(
                      (c) => c.id === course.id
                    );
                    return (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-3 bg-secondaryBackground rounded-lg"
                      >
                        <span className="text-textDefault">{course.name}</span>
                        <button
                          onClick={() =>
                            isSelected
                              ? onRemoveCourse(course.id)
                              : handleAddCourseClick(course)
                          }
                          className={`${
                            isSelected
                              ? "text-green-500 hover:text-green-600"
                              : "text-primary hover:text-primaryDark"
                          }`}
                        >
                          {isSelected ? (
                            <CheckIcon className="h-5 w-5" />
                          ) : (
                            <PlusIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </DropdownSection>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;
