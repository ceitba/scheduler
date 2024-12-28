// import React from 'react';
// import SearchBox from './SearchBox';
// import DropdownSection from './DropdownSection';
// import { SubjectList } from './SubjectsSemester';

// interface Course {
//   id: string;
//   name: string;
//   comision: string;
//   priority?: number;
// }

// const CourseView: React.FC = () => {
//   // Example data - replace with your actual data
//   const years = [
//     {
//       year: "1er Año",
//       subjects: [
//         { name: "Análisis Matemático I", link: "/subjects/am1", semester: 1 },
//         { name: "Álgebra", link: "/subjects/algebra", semester: 1 },
//         { name: "Física I", link: "/subjects/fisica1", semester: 2 },
//         // Add more subjects as needed
//       ]
//     },
//     // Add more years as needed
//   ];

//   return (
//     <div className="space-y-4">
//       <SearchBox />
//       <div className="space-y-4 flex flex-row justify-items-start space-x-4">
//         <div>
//           <h2 className="text-xl font-bold mb-4">Cursos Seleccionados</h2>
//         </div>
//       <div className="space-y-4">
//       <h2 className="text-xl font-bold mb-4">Cursos Disponibles</h2>
//         {years.map((yearData, index) => (
//           <DropdownSection key={index} title={yearData.year}>
//             <div className="flex flex-col lg:flex-row justify-between">
//               <div className="lg:w-1/2 lg:pr-4">
//                 <SubjectList
//                   semester={1}
//                   subjects={yearData.subjects.filter(s => s.semester === 1)}
//                 />
//               </div>
//               <div className="lg:w-1/2 lg:pl-4">
//                 <SubjectList
//                   semester={2}
//                   subjects={yearData.subjects.filter(s => s.semester === 2)}
//                 />
//               </div>
//             </div>
//           </DropdownSection>
//         ))}
//       </div>
//       </div>
//     </div>
//   );
// };

// export default CourseView;
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
import CommissionModal from "./ComissionModal";

interface DragItem { 
  id: string;
  type: string; 
  index: number; 
}

export interface Commission {
  id: string;
  name: string;
  schedule?: string;
}

interface Course {
  id: string;
  name: string;
  commissions: Commission[];
}

interface SelectedCourse extends Course {
  selectedCommission: string;
  isPriority: boolean;
}

interface Cuatrimestre {
  number: number;
  courses: Course[];
}

interface YearData {
  year: string;
  cuatrimestres: Cuatrimestre[];
}

const CourseView: React.FC = () => {
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newCourses = [...selectedCourses];
    const [movedItem] = newCourses.splice(fromIndex, 1);
    newCourses.splice(toIndex, 0, movedItem);
    setSelectedCourses(newCourses);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex !== dropIndex) {
      moveItem(dragIndex, dropIndex);
    }
  };

  const handleAddCourseClick = (course: Course) => {
    setSelectedCourseForModal(course);
    setModalOpen(true);
  };

  const handleCommissionSelect = (commissionId: string) => {
    if (selectedCourseForModal) {
      const commission = commissionId === 'any' 
        ? { id: 'any', name: 'Cualquier comisión' }
        : selectedCourseForModal.commissions.find(c => c.id === commissionId) 
          || selectedCourseForModal.commissions[0];
          
      handleAddCourse(selectedCourseForModal, commission);
    }
    setModalOpen(false);
    setSelectedCourseForModal(null);
  };

  const years: YearData[] = [
    {
      year: "1er Año",
      cuatrimestres: [
        {
          number: 1,
          courses: [
            {
              id: "72.11",
              name: "Análisis Matemático I",
              commissions: [
                {
                  id: "a",
                  name: "Comisión A",
                  schedule: "Lun y Mie 18:00-22:00",
                },
                {
                  id: "b",
                  name: "Comisión B",
                  schedule: "Mar y Jue 18:00-22:00",
                },
              ],
            },
            {
              id: "73.11",
              name: "Álgebra",
              commissions: [
                {
                  id: "a",
                  name: "Comisión A",
                  schedule: "Mar y Jue 18:00-22:00",
                },
                {
                  id: "b",
                  name: "Comisión B",
                  schedule: "Lun y Mie 18:00-22:00",
                },
              ],
            },
          ],
        },
        {
          number: 2,
          courses: [
            {
              id: "58.11",
              name: "Física I",
              commissions: [
                {
                  id: "a",
                  name: "Comisión A",
                  schedule: "Lun y Mie 18:00-22:00",
                },
                {
                  id: "b",
                  name: "Comisión B",
                  schedule: "Mar y Jue 18:00-22:00",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      year: "2do Año",
      cuatrimestres: [
        {
          number: 1,
          courses: [
            {
              id: "72.11",
              name: "Análisis Matemático I",
              commissions: [
                {
                  id: "a",
                  name: "Comisión A",
                  schedule: "Lun y Mie 18:00-22:00",
                },
                {
                  id: "b",
                  name: "Comisión B",
                  schedule: "Mar y Jue 18:00-22:00",
                },
              ],
            },
            {
              id: "73.11",
              name: "Álgebra",
              commissions: [
                {
                  id: "a",
                  name: "Comisión A",
                  schedule: "Mar y Jue 18:00-22:00",
                },
                {
                  id: "b",
                  name: "Comisión B",
                  schedule: "Lun y Mie 18:00-22:00",
                },
              ],
            },
          ],
        },
        {
          number: 2,
          courses: [
            {
              id: "58.11",
              name: "Física I",
              commissions: [
                {
                  id: "a",
                  name: "Comisión A",
                  schedule: "Lun y Mie 18:00-22:00",
                },
                {
                  id: "b",
                  name: "Comisión B",
                  schedule: "Mar y Jue 18:00-22:00",
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const handleAddCourse = (course: Course, commission: Commission) => {
    if (!selectedCourses.find((c) => c.id === course.id)) {
      setSelectedCourses([
        ...selectedCourses,
        {
          ...course,
          selectedCommission: commission.id,
          isPriority: false,
        },
      ]);
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter((c) => c.id !== courseId));
  };

  return (
    <div className="mx-auto py-2">
      <SearchBox />
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background shadow-md rounded-lg p-4">
          <TooltipHeader
            title="Cursos Seleccionados"
            tooltip="Arrastra las materias para ordenarlas de forma decreciente según importancia."
            className="mb-4"
          />
          <div className="space-y-2">
            {selectedCourses.map((course, index) => (
              <div
                key={course.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="flex flex-col p-3 bg-secondaryBackground rounded-md space-y-2 cursor-move hover:shadow-sm transition-shadow"
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
                      onClick={() => handleRemoveCourse(course.id)}
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

        <div className="bg-background shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold text-textDefault mb-4">
            Cursos Disponibles
          </h2>
          <div className="space-y-4">
            {years.map((yearData) => (
              <DropdownSection key={yearData.year} title={yearData.year}>
                {yearData.cuatrimestres.map((cuatrimestre) => (
                  <div key={cuatrimestre.number} className="mt-4">
                    <h3 className="text-sm font-semibold mb-2 uppercase text-secondary">
                      Cuatrimestre {cuatrimestre.number}
                    </h3>
                    <div className="space-y-2">
                      {cuatrimestre.courses.map((course) => {
                        const isSelected = selectedCourses.some(
                          (c) => c.id === course.id
                        );
                        return (
                          <div
                            key={course.id}
                            className="flex items-center justify-between p-3 bg-secondaryBackground rounded-md"
                          >
                            <span className="text-textDefault">{course.name}</span>
                            <button
                              onClick={() =>
                                isSelected
                                  ? handleRemoveCourse(course.id)
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
                  </div>
                ))}
              </DropdownSection>
            ))}
          </div>
        </div>
      </div>

      <CommissionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleCommissionSelect}
        commission={selectedCourseForModal?.commissions || []}
        courseName={selectedCourseForModal?.name || ''}
      />
    </div>
  );
};

export default CourseView;
