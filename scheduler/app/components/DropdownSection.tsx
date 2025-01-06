import { ReactNode } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface DropdownSectionProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const DropdownSection: React.FC<DropdownSectionProps> = ({ 
  title, 
  children,
  isOpen,
  onToggle
}) => {
  return (
    <div>
      <div
        className="cursor-pointer select-none py-2 flex items-center uppercaseTitle"
        onClick={onToggle}
      >
        {isOpen ? (
          <ChevronUpIcon className="h-4 w-4 mr-2" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 mr-2" />
        )}
        <span>{title}</span>
      </div>
      {isOpen && (
        <div className="ml-6">
          <hr className="border-none" />
          {children}
        </div>
      )}
    </div>
  );
};

export default DropdownSection;
