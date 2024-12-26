import { useState, ReactNode } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface DropdownSectionProps {
  title: string;
  children: ReactNode;
}

const DropdownSection: React.FC<DropdownSectionProps> = ({
  title,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div
        className="cursor-pointer select-none py-2 flex items-center uppercaseTitle "
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDownIcon className="h-4 w-4 mr-2" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 mr-2" />
        )}
        <span>{title}</span>
      </div>
      {isOpen && (
        <div className="ml-6">
          <hr className="pb-4 border-t border-secondaryBackground" />
          {children}
        </div>
      )}
    </div>
  );
};

export default DropdownSection;
