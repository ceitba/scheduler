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
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import PriorityToggle from "./PrioritySelector";

interface Commission {
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
  const [expandedYears, setExpandedYears] = useState<string[]>([]);
  const [selectedCommission, setSelectedCommission] = useState<string>("");

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

  const toggleYear = (year: string) => {
    setExpandedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

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

  const handlePriorityToggle = (courseId: string) => {
    setSelectedCourses(
      selectedCourses.map((course) =>
        course.id === courseId
          ? { ...course, isPriority: !course.isPriority }
          : course
      )
    );
  };

  const handleCommissionChange = (courseId: string, commissionId: string) => {
    setSelectedCourses(
      selectedCourses.map((course) =>
        course.id === courseId
          ? { ...course, selectedCommission: commissionId }
          : course
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <SearchBox />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background border border-gray/20 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-textDefault mb-4">
            Cursos Seleccionados
          </h2>
          <div className="space-y-2">
            {selectedCourses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col p-3 bg-secondaryBackground rounded-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bars3Icon className="h-5 w-5 text-gray cursor-move" />
                    <span className="text-textDefault">{course.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <PriorityToggle
                      isPriority={course.isPriority}
                      onChange={() => handlePriorityToggle(course.id)}
                    />
                    <button
                      onClick={() => handleRemoveCourse(course.id)}
                      className="text-gray hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4 pl-8">
                  <select
                    value={course.selectedCommission}
                    onChange={(e) =>
                      handleCommissionChange(course.id, e.target.value)
                    }
                    className="bg-background border border-gray/20 rounded px-2 py-1 text-sm flex-1"
                  >
                    {course.commissions.map((comm) => (
                      <option key={comm.id} value={comm.id}>
                        {comm.name} - {comm.schedule}
                      </option>
                    ))}
                  </select>
                  {/* <select
                    value={course.priority}
                    onChange={(e) => handlePriorityChange(course.id, Number(e.target.value))}
                    className="bg-background border border-gray/20 rounded px-2 py-1 text-sm w-32"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        Prioridad {num}
                      </option>
                    ))}
                  </select> */}
                </div>
              </div>
            ))}
            {selectedCourses.length === 0 && (
              <div className="text-gray text-center py-8">
                No hay cursos seleccionados
              </div>
            )}
          </div>
        </div>

        {/* Available Courses Section */}
        <div className="bg-background border border-gray/20 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-textDefault mb-4">
            Cursos Disponibles
          </h2>
          <div className="space-y-4">
            {years.map((yearData) => (
              <div
                key={yearData.year}
                className="border border-gray/20 rounded-lg"
              >
                <button
                  onClick={() => toggleYear(yearData.year)}
                  className="w-full flex justify-between items-center p-3 hover:bg-gray/5"
                >
                  <span className="font-medium">{yearData.year}</span>
                  {expandedYears.includes(yearData.year) ? (
                    <ChevronUpIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                  )}
                </button>

                {expandedYears.includes(yearData.year) && (
                  <div className="p-3 space-y-4">
                    {yearData.cuatrimestres.map((cuatrimestre) => (
                      <div key={cuatrimestre.number}>
                        <h3 className="font-medium text-sm text-gray mb-2">
                          Cuatrimestre {cuatrimestre.number}
                        </h3>
                        <div className="space-y-2">
                          {cuatrimestre.courses.map((course) => (
                            <div
                              key={course.id}
                              className="bg-secondaryBackground rounded-md p-3"
                            >
                              <div className="font-medium mb-2">
                                {course.name}
                              </div>
                              <div className="grid gap-2">
                                {course.commissions.map((commission) => (
                                  <button
                                    key={commission.id}
                                    onClick={() =>
                                      handleAddCourse(course, commission)
                                    }
                                    disabled={selectedCourses.some(
                                      (c) => c.id === course.id
                                    )}
                                    className={`w-full text-left px-3 py-2 rounded
                                      ${
                                        selectedCourses.some(
                                          (c) => c.id === course.id
                                        )
                                          ? "bg-gray/10 text-gray cursor-not-allowed"
                                          : "bg-background hover:bg-gray/10 text-textDefault"
                                      }`}
                                  >
                                    <div className="flex justify-between items-center text-sm">
                                      <span>{commission.name}</span>
                                      <span className="text-gray">
                                        {commission.schedule}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;
