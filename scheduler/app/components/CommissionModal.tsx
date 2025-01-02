import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

// Day translation mapping
const DAY_TRANSLATIONS: Record<string, string> = {
  monday: "Lun.",
  tuesday: "Mar.",
  wednesday: "Mie.",
  thursday: "Jue.",
  friday: "Vie.",
  saturday: "Sab.",
  sunday: "Dom.",
};

interface Schedule {
  day: string;
  classroom: string;
  building: string;
  timeFrom: string;
  timeTo: string;
}

interface Commission {
  name: string;
  schedule: Schedule[];
}

interface CommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (commissionId: string) => void;
  commission: Commission[];
  courseName: string;
  courseId: string;
}

const CommissionModal: React.FC<CommissionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  commission,
  courseName,
  courseId,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Full page backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[100]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[101]">
        <div className="bg-background rounded-xl w-full max-w-md relative flex flex-col max-h-[70vh]">
          {/* Header - fixed */}
          <div className="p-6 pb-0">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray hover:text-red-500 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold text-textDefault mb-1">
              Seleccionar Comisión
            </h3>
            <p className="text-sm text-gray mb-6">
              ({courseId}) {courseName}
            </p>
          </div>

          {/* Content - scrollable */}
          <div className="p-6 pt-0 overflow-y-auto">
            <div className="space-y-2">
              {/* Any commission option */}
              <button
                onClick={() => onSelect("any")}
                className="w-full p-3 text-left rounded-lg bg-secondaryBackground 
                  hover:bg-primary/10 hover:text-primary
                  transition-all duration-200 group"
              >
                <span className="text-textDefault group-hover:text-primary transition-colors">
                  Cualquier comisión
                </span>
              </button>

              {/* Specific commissions */}
              {commission.map((comm) => (
                <button
                  key={comm.name}
                  onClick={() => onSelect(comm.name)}
                  className="w-full p-3 text-left rounded-lg bg-secondaryBackground 
                    hover:bg-primary/10 hover:text-primary
                    transition-all duration-200 group"
                >
                  <span className="text-textDefault group-hover:text-primary transition-colors">
                    Comisión {comm.name.toUpperCase()}
                  </span>
                  {comm.schedule && comm.schedule.length > 0 && (
                    <span className="block text-sm text-gray group-hover:text-primary/70 transition-colors mt-1">
                      {/* {comm.schedule.map(formatSchedule).join(`\t`)} */}
                      {comm.schedule.map((s, i) => (
                        <div key={i} className="text-xs text-gray">
                          {DAY_TRANSLATIONS[s.day.toLowerCase()]}{" "}
                          {s.timeFrom.slice(0, 5)} - {s.timeTo.slice(0, 5)} |{" "}
                          {s.classroom}
                        </div>
                      ))}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommissionModal;
