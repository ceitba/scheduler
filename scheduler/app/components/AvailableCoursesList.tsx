import { type Subject } from "../hooks/useSubjects";
import DropdownSection from "./DropdownSection";
import CourseCard from "./CourseCard";

interface AvailableCoursesListProps {
  courses: Record<number, { 
    year: string; 
    subjects: {
      '1': Subject[];
      '2': Subject[];
    }
  }>;
  selectedCourses: Subject[];
  onCourseClick: (course: Subject) => void;
}

const QuarterSection: React.FC<{
  title: string;
  subjects: Subject[];
  selectedCourses: Subject[];
  onCourseClick: (course: Subject) => void;
}> = ({ title, subjects, selectedCourses, onCourseClick }) => {
  if (!subjects?.length) return null;
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray">{title}</h3>
      <div className="space-y-2 ml-2">
        {subjects.map((course) => {
          const isSelected = selectedCourses.some(
            (c) => c.subject_id === course.subject_id
          );
          return (
            <CourseCard
              key={course.subject_id}
              course={course}
              isSelected={isSelected}
              onClick={() => onCourseClick(course)}
            />
          );
        })}
      </div>
    </div>
  );
};

const AvailableCoursesList: React.FC<AvailableCoursesListProps> = ({
  courses,
  selectedCourses,
  onCourseClick,
}) => {
  return (
    <div className="bg-secondaryBackground/30 rounded-xl">
      <h2 className="text-lg font-semibold text-textDefault mb-4">
        Cursos disponibles
      </h2>
      <div className="space-y-4">
        {Object.values(courses).map((yearData) => (
          <DropdownSection key={yearData.year} title={yearData.year}>
            <div className="space-y-4">
              <QuarterSection
                title="PRIMER CUATRIMESTRE"
                subjects={yearData.subjects['1']}
                selectedCourses={selectedCourses}
                onCourseClick={onCourseClick}
              />
              <QuarterSection
                title="SEGUNDO CUATRIMESTRE"
                subjects={yearData.subjects['2']}
                selectedCourses={selectedCourses}
                onCourseClick={onCourseClick}
              />
            </div>
          </DropdownSection>
        ))}
      </div>
    </div>
  );
};

export default AvailableCoursesList; 