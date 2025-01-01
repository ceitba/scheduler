import { CheckIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { type Subject } from "../hooks/useSubjects";

interface CourseCardProps {
  course: Subject;
  isSelected: boolean;
  onClick: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-3 bg-secondaryBackground 
        rounded-lg group cursor-pointer hover:bg-secondaryBackground/70 ${
          isSelected
            ? "text-green-500 hover:text-red-500"
            : "text-gray hover:text-primary"
        }`}
    >
      <span>{course.name}</span>
      <div>
        {isSelected ? (
          <>
            <CheckIcon className="h-5 w-5 group-hover:hidden" />
            <TrashIcon className="h-5 w-5 text-red-500 hidden group-hover:block" />
          </>
        ) : (
          <PlusIcon className="h-5 w-5" />
        )}
      </div>
    </div>
  );
};

export default CourseCard; 