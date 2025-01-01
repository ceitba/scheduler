import React from "react";
import SearchBox from "./SearchBox";
import { useSubjects, type Subject } from "../hooks/useSubjects";
import SelectedCoursesList from "./SelectedCoursesList";
import AvailableCoursesList from "./AvailableCoursesList";

interface SelectedCourse extends Subject {
  selectedCommission: string;
  isPriority: boolean;
}

interface CourseViewProps {
  selectedCourses: SelectedCourse[];
  onCommissionSelect: (course: Subject) => void;
  onAddCourse: (course: Subject, commission: { id: string; name: string }) => void;
  onRemoveCourse: (courseId: string) => void;
  onReorderCourses: (courses: SelectedCourse[]) => void;
}

const CourseView: React.FC<CourseViewProps> = ({ 
  selectedCourses, 
  onCommissionSelect, 
  onAddCourse,
  onRemoveCourse,
  onReorderCourses
}) => {
  const { subjects, loading, error } = useSubjects();

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
    if (selectedCourses.some(c => c.id === course.id)) {
      onRemoveCourse(course.id);
      return;
    }

    if (course.commissions.length === 1) {
      onAddCourse(course, course.commissions[0]);
      return;
    }

    onCommissionSelect(course);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-bounce rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <SelectedCoursesList 
          courses={selectedCourses}
          onRemove={onRemoveCourse}
          onReorder={onReorderCourses}
        />
        <AvailableCoursesList
          courses={subjectsByYear}
          selectedCourses={selectedCourses}
          onCourseClick={handleAddCourseClick}
        />
      </div>
    </div>
  );
};

export default CourseView;
