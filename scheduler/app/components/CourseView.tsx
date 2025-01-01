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

  // Group subjects by year and quarter
  const subjectsByYear = subjects.reduce((acc, subject) => {
    const year = subject.year || 0;
    if (!acc[year]) {
      acc[year] = {
        year: year === 0 ? 'ELECTIVAS' : `${year}° Año`,
        subjects: {
          '1': [],
          '2': [],
          'extra': []
        }
      };
    }

    // Add subject to appropriate quarter
    const quarter = subject.semester?.toString() || '1';
    if (quarter === '1' || quarter === '2') {
      acc[year].subjects[quarter]?.push(subject);
    } else {
      acc[year].subjects.extra.push(subject);
    }
    
    return acc;
  }, {} as Record<number, { 
    year: string; 
    subjects: {
      '1': Subject[];
      '2': Subject[];
      'extra': Subject[];
    }
  }>);

  // Sort years (ELECTIVAS at the bottom)
  const sortedSubjectsByYear = Object.entries(subjectsByYear)
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
    }, {} as Record<number, typeof subjectsByYear[number]>);

  const handleSubjectSelect = (subject: Subject) => {
    if (selectedCourses.some(c => c.subject_id === subject.subject_id)) {
      onRemoveCourse(subject.subject_id);
      return;
    }

    if (subject.commissions.length === 1) {
      onAddCourse(subject, { 
        id: subject.commissions[0].name,
        name: subject.commissions[0].name 
      });
      return;
    }

    onCommissionSelect(subject);
  };

  // TODO: Create custom loading component
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
    <div className="mx-0 relative overflow-hidden">
      <SearchBox 
        subjects={subjects}
        onSelectSubject={handleSubjectSelect}
      />
      
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden h-min">
        <SelectedCoursesList 
          courses={selectedCourses}
          onRemove={onRemoveCourse}
          onReorder={onReorderCourses}
        />
        <AvailableCoursesList
          courses={sortedSubjectsByYear}
          selectedCourses={selectedCourses}
          onCourseClick={handleSubjectSelect}
        />
      </div>
    </div>
  );
};

export default CourseView;
