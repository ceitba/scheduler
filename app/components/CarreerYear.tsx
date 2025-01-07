import React from "react";
import { SubjectList, Subject } from "./SubjectsSemester";
import DropdownSection from "./DropdownSection";

interface CarreerYearProps {
  year: string;
  subjects: Subject[];
}

const CarreerYear: React.FC<CarreerYearProps> = ({ year, subjects }) => {
  const firstSemesterSubjects = subjects.filter(
    (subject) => subject.semester === 1,
  );
  const secondSemesterSubjects = subjects.filter(
    (subject) => subject.semester === 2,
  );

  return (
    <div className="mb-2">
      <DropdownSection title={year} isOpen={true} onToggle={() => {}}>
        <div className="">
          <div className="flex flex-col lg:flex-row justify-between">
            <div className="lg:w-1/2 lg:pr-4">
              <SubjectList semester={1} subjects={firstSemesterSubjects} />
            </div>
            <div className="lg:w-1/2 lg:pl-4">
              <SubjectList semester={2} subjects={secondSemesterSubjects} />
            </div>
          </div>
        </div>
      </DropdownSection>
    </div>
  );
};

export default CarreerYear;
