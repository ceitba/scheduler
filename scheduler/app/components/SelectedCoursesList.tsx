import { Bars3Icon, TrashIcon } from "@heroicons/react/24/outline";
import TooltipHeader from "./Tooltip";
import { type Subject } from "../hooks/useSubjects";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SelectedCourse extends Subject {
  selectedCommission: string;
  isPriority: boolean;
}

interface SortableItemProps {
  course: SelectedCourse;
  onRemove: (id: string) => void;
}

const SortableItem = ({ course, onRemove }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col p-3 bg-secondaryBackground rounded-lg space-y-2 select-none"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
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
  );
};

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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = courses.findIndex((course) => course.id === active.id);
      const newIndex = courses.findIndex((course) => course.id === over.id);
      onReorder(arrayMove(courses, oldIndex, newIndex));
    }
  };

  return (
    <div className="bg-secondaryBackground/30 rounded-xl p-4">
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={courses.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {courses.map((course) => (
              <SortableItem
                key={course.id}
                course={course}
                onRemove={onRemove}
              />
            ))}
            {courses.length === 0 && (
              <div className="text-gray text-center py-8">
                No tiene cursos seleccionados
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SelectedCoursesList; 