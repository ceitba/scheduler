import React from 'react';
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface TooltipHeaderProps {
  title: string;
  tooltip: string;
  className?: string;
}

const TooltipHeader: React.FC<TooltipHeaderProps> = ({ title, tooltip, className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <h2 className="text-lg font-semibold text-textDefault">
        {title}
      </h2>
      <div className="group relative inline-block">
        <InformationCircleIcon className="h-5 w-5 text-gray hover:text-primary cursor-help" />
        <span className="pointer-events-none absolute -top-2 left-6 min-w-[100px] sm:min-w-[350px] whitespace-normal opacity-0 transition-opacity group-hover:opacity-100 bg-background text-textDefault text-sm py-1 px-2 rounded shadow-lg border border-gray/20">
          {tooltip}
        </span>
      </div>
    </div>
  );
};

export default TooltipHeader;