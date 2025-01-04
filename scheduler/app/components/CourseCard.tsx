// import { CheckIcon } from "@heroicons/react/24/outline";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
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
      className="flex items-center justify-between p-3 bg-secondaryBackground 
        rounded-lg group cursor-pointer hover:bg-surface"
    >
      <div className="flex flex-row space-x-2">
      <span className="text-textDefault">
        ({course.subject_id}) 
      </span>
      <div className="flex flex-col">
      <span className="text-textDefault">
      {course.name}
      </span>
      <span className="text-xs text-gray">
        {course.credits} créditos
      </span>
      </div>     
      </div>
       
      <div>
        {isSelected ? (
          <div className="flex items-center">
            <TrashIcon className="h-5 w-5 group-hover:text-red-500 text-gray block" />
            {/* <TrashIcon className="h-5 w-5 text-red-500 hidden group-hover:block" /> */}
          </div>
        ) : (
          <PlusIcon className="h-5 w-5 text-gray group-hover:text-primary" />
        )}
      </div>
    </div>
  );
};

export default CourseCard; 