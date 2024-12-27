import React from 'react';
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { ExclamationTriangleIcon as ExclamationTriangleOutline } from "@heroicons/react/24/outline";

interface PriorityToggleProps {
  isPriority: boolean;
  onChange: (isPriority: boolean) => void;
}

const PriorityToggle: React.FC<PriorityToggleProps> = ({ isPriority, onChange }) => {
  return (
    <button
      onClick={() => onChange(!isPriority)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors
        ${isPriority 
          ? 'bg-red-50 border-red-200 hover:bg-red-100' 
          : 'border-gray/20 hover:bg-gray/5'
        }`}
      title={isPriority ? "Marcar como no prioritaria" : "Marcar como prioritaria"}
    >
      {isPriority ? (
        <>
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          <span className="text-sm font-medium text-red-600">Prioritaria</span>
        </>
      ) : (
        <>
          <ExclamationTriangleOutline className="h-5 w-5 text-gray" />
          <span className="text-sm font-medium text-gray">Prioritaria</span>
        </>
      )}
    </button>
  );
};

export default PriorityToggle;