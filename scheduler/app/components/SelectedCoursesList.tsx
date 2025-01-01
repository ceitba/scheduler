import { Bars3Icon, TrashIcon } from "@heroicons/react/24/outline";
import TooltipHeader from "./Tooltip";
import { type Subject } from "../hooks/useSubjects";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface SelectedCourse extends Subject {
  selectedCommission: string;
  isPriority: boolean;
}

interface SelectedCoursesListProps {
  courses: SelectedCourse[];
  onRemove: (courseId: string) => void;
  onReorder: (courses: SelectedCourse[]) => void;
}

const SelectedCoursesList: React.FC<SelectedCoursesListProps> = ({ 
  courses, 
  onRemove,
  onReorder 
}) => {
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(courses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items);
  };

  return (
    <div className="bg-secondaryBackground/30 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <TooltipHeader
          title="Cursos seleccionados"
          tooltip="Arrastra las materias para ordenarlas según prioridad"
        />
        {totalCredits > 0 && (
          <div className="text-sm text-gray">
            <span className="font-medium">{totalCredits}</span> créditos
          </div>
        )}
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="courses">
          {(provided) => (
            <div 
              className="space-y-2"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {courses.map((course, index) => (
                <Draggable 
                  key={course.id} 
                  draggableId={course.id} 
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex flex-col p-3 bg-secondaryBackground rounded-lg 
                        space-y-2 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing"
                          >
                            <Bars3Icon className="h-5 w-5 text-gray" />
                          </div>
                          <span className="text-textDefault">{course.name}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray">
                            {course.selectedCommission === 'any' 
                              ? 'Cualquier comisión' 
                              : `Comisión ${course.selectedCommission.toUpperCase()}`}
                          </span>
                          <button
                            onClick={() => onRemove(course.id)}
                            className="text-gray hover:text-red-500"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {courses.length === 0 && (
                <div className="text-gray text-center py-8">
                  No tiene cursos seleccionados
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default SelectedCoursesList; 