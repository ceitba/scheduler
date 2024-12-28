import React from 'react';
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface TooltipHeaderProps {
  title: string;
  tooltip: string;
  className?: string;
}

const TooltipHeader: React.FC<TooltipHeaderProps> = ({ title, tooltip, className = "" }) => {
  return (
    <div className="relative inline-flex items-center gap-2">
      <h2 className={`text-lg font-semibold text-textDefault ${className}`}>
        {title}
      </h2>
      <div className="group relative">
        <InformationCircleIcon className="h-5 w-5 text-gray/60" />
        <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          bg-gray-800 text-textDefault p-2 rounded text-sm whitespace-nowrap">
          {tooltip}
        </div>
      </div>
    </div>
  );
};

export default TooltipHeader;