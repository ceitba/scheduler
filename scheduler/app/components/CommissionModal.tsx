import { Commission } from '../types/scheduler';
import BaseModal from './BaseModal';
import { FiCheck } from 'react-icons/fi';

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
  commission = [],
  courseName,
  courseId,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Seleccionar Comisión"
    >
      <p className="text-sm text-gray mb-4">
        ({courseId}) {courseName}
      </p>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {/* Option for any commission */}
        <button
          onClick={() => {
            onSelect('any');
            onClose();
          }}
          className="w-full p-3 text-left rounded-lg bg-secondaryBackground hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <FiCheck className="w-5 h-5 text-gray group-hover:text-primary transition-colors" />
            <span className="text-textDefault group-hover:text-primary transition-colors">
              Cualquier comisión
            </span>
          </div>
        </button>

        {/* List of specific commissions */}
        {commission.map((comm) => (
          <button
            key={comm.name}
            onClick={() => {
              onSelect(comm.name);
              onClose();
            }}
            className="w-full p-3 text-left rounded-lg bg-secondaryBackground hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <FiCheck className="w-5 h-5 text-gray group-hover:text-primary transition-colors" />
              <span className="text-textDefault group-hover:text-primary transition-colors">
                Comisión {comm.name.toUpperCase()}
              </span>
            </div>
            {comm.schedule && comm.schedule.length > 0 && (
              <div className="pl-9 mt-1">
                {comm.schedule.map((slot, idx) => (
                  <div key={idx} className="text-xs text-gray group-hover:text-primary/70 transition-colors">
                    {DAY_TRANSLATIONS[slot.day.toLowerCase()]}{" "}
                    {slot.timeFrom.slice(0, 5)} - {slot.timeTo.slice(0, 5)} |{" "}
                    {slot.classroom}
                  </div>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </BaseModal>
  );
};

export default CommissionModal;
