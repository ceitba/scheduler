import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import React from "react";

interface DropdownProps {
  title: string;
  items: string[];
  expanded: boolean;
  onClick: () => void;
}

export const Dropdown: React.FC<DropdownProps> = ({ title, items, expanded, onClick }) => {
  return (
    <div>
      <div
        className="cursor-pointer py-2 font-bold flex justify-between items-center"
        onClick={onClick}
      >
        <span>{title}</span>
        {expanded ? (
          <ChevronDownIcon className="h-5 w-5 stroke-2" />
        ) : (
          <ChevronRightIcon className="h-5 w-5 stroke-2" />
        )}
      </div>
      {expanded && (
        <div className="ml-2 cursor-pointer">
          {items.map((item, index) => (
            <div key={index} className="py-2">
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};