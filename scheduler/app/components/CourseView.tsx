import React from 'react';
import SearchBox from './SearchBox';
import DropdownSection from './DropdownSection';
import { SubjectList } from './SubjectsSemester';

const CourseView: React.FC = () => {
  // Example data - replace with your actual data
  const years = [
    {
      year: "1er Año",
      subjects: [
        { name: "Análisis Matemático I", link: "/subjects/am1", semester: 1 },
        { name: "Álgebra", link: "/subjects/algebra", semester: 1 },
        { name: "Física I", link: "/subjects/fisica1", semester: 2 },
        // Add more subjects as needed
      ]
    },
    // Add more years as needed
  ];

  return (
    <div className="space-y-4">
      <SearchBox />
      <div className="space-y-2">
        {years.map((yearData, index) => (
          <DropdownSection key={index} title={yearData.year}>
            <div className="flex flex-col lg:flex-row justify-between">
              <div className="lg:w-1/2 lg:pr-4">
                <SubjectList 
                  semester={1} 
                  subjects={yearData.subjects.filter(s => s.semester === 1)} 
                />
              </div>
              <div className="lg:w-1/2 lg:pl-4">
                <SubjectList 
                  semester={2} 
                  subjects={yearData.subjects.filter(s => s.semester === 2)} 
                />
              </div>
            </div>
          </DropdownSection>
        ))}
      </div>
    </div>
  );
};

export default CourseView; 