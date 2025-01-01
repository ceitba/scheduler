import { type Subject } from "../hooks/useSubjects";
import DropdownSection from "./DropdownSection";
import CourseCard from "./CourseCard";

interface AvailableCoursesListProps {
  courses: Record<number, { year: string; subjects: Subject[] }>;
  selectedCourses: Subject[];
  onCourseClick: (course: Subject) => void;
}

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
            <div className="space-y-2">
              {yearData.subjects.map((course) => {
                const isSelected = selectedCourses.some(
                  (c) => c.id === course.id
                );
                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isSelected={isSelected}
                    onClick={() => onCourseClick(course)}
                  />
                );
              })}
            </div>
          </DropdownSection>
        ))}
      </div>
    </div>
  );
};

export default AvailableCoursesList; 