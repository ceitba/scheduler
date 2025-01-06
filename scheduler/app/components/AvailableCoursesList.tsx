import { type Subject } from "../hooks/useSubjects";
import DropdownSection from "./DropdownSection";
import CourseCard from "./CourseCard";
import { useState } from "react";

interface AvailableCoursesListProps {
  courses: Record<number, { 
    year: string; 
    subjects: Record<string, Subject[]>;
  }>;
  selectedCourses: Subject[];
  onCourseClick: (course: Subject) => void;
  isExchange?: boolean;
}

const QuarterSection: React.FC<{
  title: string;
  subjects: Subject[];
  selectedCourses: Subject[];
  onCourseClick: (course: Subject) => void;
  showTitle?: boolean;
}> = ({ title, subjects, selectedCourses, onCourseClick, showTitle = true }) => {
  if (!subjects?.length) return null;
  
  return (
    <div className="space-y-2">
      {showTitle && <h3 className="text-sm font-medium text-gray">{title}</h3>}
      <div className={`space-y-2 ${showTitle ? 'ml-2' : ''}`}>
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
  isExchange = false
}) => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  if (isExchange) {
    // For exchanges, show a flat list of all subjects
    const exchangeSubjects = Object.values(courses)[0]?.subjects['1'] || [];
    return (
      <div className="bg-background rounded-xl flex flex-col">
        <h2 className="text-lg font-semibold text-textDefault p-4 pb-2">
          Cursos disponibles
        </h2>
        <div className="overflow-y-auto flex-1 px-4 pb-4">
          <QuarterSection
            title=""
            subjects={exchangeSubjects}
            selectedCourses={selectedCourses}
            onCourseClick={onCourseClick}
            showTitle={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondaryBackground/30 rounded-xl flex flex-col">
      <h2 className="text-lg font-semibold text-textDefault p-4 pb-2">
        Cursos disponibles
      </h2>
      <div className="overflow-y-auto flex-1 px-4 pb-4">
        <div className="space-y-2">
          {Object.values(courses).map((yearData) => (
            <DropdownSection 
              key={yearData.year} 
              title={yearData.year}
              isOpen={openSection === yearData.year}
              onToggle={() => setOpenSection(
                openSection === yearData.year ? null : yearData.year
              )}
            >
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
                {Object.entries(yearData.subjects).map(([category, subjects]) => (
                  category !== '1' && category !== '2' && subjects.length > 0 && (
                    <QuarterSection
                      key={category}
                      title={category.toUpperCase()}
                      subjects={subjects}
                      selectedCourses={selectedCourses}
                      onCourseClick={onCourseClick}
                    />
                  )
                ))}
              </div>
            </DropdownSection>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvailableCoursesList;