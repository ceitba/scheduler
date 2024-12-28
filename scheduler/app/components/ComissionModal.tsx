import React from 'react';
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Commission } from './CourseView';

interface CommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (commissionId: string) => void;
  commission: Commission[];
  courseName: string;
}

const CommissionModal: React.FC<CommissionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  commission,
  courseName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 md:flex md:items-center md:justify-center">
      <div 
        className="fixed bottom-0 left-0 right-0 w-screen 
          md:static md:w-full md:max-w-md md:mx-auto"
      >
        <div 
          className="bg-background rounded-t-xl md:rounded-xl max-h-[90vh] md:max-h-[85vh] 
            flex flex-col shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray/20">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium truncate">{courseName}</h3>
              <p className="text-sm text-gray truncate">Selecciona una comisión</p>
            </div>
            <button 
              onClick={onClose}
              className="ml-2 p-1 rounded-lg hover:bg-gray/10"
            >
              <XMarkIcon className="h-5 w-5 text-gray" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-3">
            <div className="space-y-2">
              <button
                onClick={() => {
                  onSelect('any');
                  onClose();
                }}
                className="w-full flex flex-col p-3 text-left rounded-lg
                  bg-secondaryBackground hover:bg-gray/10 transition-colors"
              >
                <div className="font-medium">Cualquier comisión</div>
                <div className="text-sm text-gray">Se ajustará según disponibilidad</div>
              </button>

              {commission.map((comm) => (
                <button
                  key={comm.id}
                  onClick={() => {
                    onSelect(comm.id);
                    onClose();
                  }}
                  className="w-full flex flex-col p-3 text-left rounded-lg
                    bg-secondaryBackground hover:bg-gray/10 transition-colors"
                >
                  <div className="font-medium">{comm.name}</div>
                  {comm.schedule && (
                    <div className="text-sm text-gray">{comm.schedule}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray/20">
            <button
              onClick={onClose}
              className="w-full p-2.5 text-center rounded-lg border border-gray/20
                hover:bg-gray/5 text-gray font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionModal;