import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (commissionId: string) => void;
  commission: {
    id: string;
    name: string;
    schedule?: string;
  }[];
  courseName: string;
}

const CommissionModal: React.FC<CommissionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  commission,
  courseName,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Full page backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[100]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[101]">
        <div className="bg-background rounded-xl p-6 w-full max-w-md relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray hover:text-red-500 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          {/* Modal content */}
          <h3 className="text-lg font-semibold text-textDefault mb-1">
            Seleccionar Comisión
          </h3>
          <p className="text-sm text-gray mb-6">
            {courseName}
          </p>

          <div className="space-y-2">
            {/* Any commission option */}
            <button
              onClick={() => onSelect('any')}
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
                key={comm.id}
                onClick={() => onSelect(comm.id)}
                className="w-full p-3 text-left rounded-lg bg-secondaryBackground 
                  hover:bg-primary/10 hover:text-primary
                  transition-all duration-200 group"
              >
                <span className="text-textDefault group-hover:text-primary transition-colors">
                  Comisión {comm.id.toUpperCase()}
                </span>
                {comm.schedule && (
                  <span className="block text-sm text-gray group-hover:text-primary/70 transition-colors mt-1">
                    {comm.schedule}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CommissionModal; 