import React, { useState, useEffect } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import BaseModal from './BaseModal';
import { Subject } from '../hooks/useSubjects';
import { CommissionSchedule } from '../types/scheduler';

interface CommissionSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
  onAddCommissions: (commissions: string[]) => void;
}

const dayTranslations: { [key: string]: string } = {
  'MONDAY': 'Lun',
  'TUESDAY': 'Mar',
  'WEDNESDAY': 'Mie',
  'THURSDAY': 'Jue',
  'FRIDAY': 'Vie',
  'SATURDAY': 'Sab',
  'SUNDAY': 'Dom'
};

const CommissionSelectionModal: React.FC<CommissionSelectionModalProps> = ({
  isOpen,
  onClose,
  subject,
  onAddCommissions,
}) => {
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const validCommissions = subject.commissions.filter(comm => comm.schedule?.length > 0);

  // Reset selections when modal opens with new subject
  useEffect(() => {
    if (isOpen) {
      setSelectedCommissions([]);
    }
  }, [isOpen, subject]);

  const handleCommissionToggle = (commissionName: string) => {
    setSelectedCommissions(prev => 
      prev.includes(commissionName)
        ? prev.filter(c => c !== commissionName)
        : [...prev, commissionName]
    );
  };

  const handleSelectAll = () => {
    onAddCommissions(validCommissions.map(c => c.name));
    onClose();
  };

  const handleAddCommissions = () => {
    if (selectedCommissions.length > 0) {
      onAddCommissions(selectedCommissions);
      onClose();
    }
  };

  const formatSchedule = (schedule: CommissionSchedule[]) => {
    return schedule.map(s => {
      const location = s.building ? ` | ${s.classroom}` : ' | Virtual asincrónico';
      return `${dayTranslations[s.day]}. ${s.time_from.slice(0, 5)} - ${s.time_to.slice(0, 5)}${location}`;
    }).join('\n');
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Seleccionar comisión"
    >
      <div className="space-y-4">
        <div className="text-sm text-gray">
          <div className="font-medium text-textDefault text-base mb-1">
            ({subject.subject_id}) {subject.name}
          </div>
          <p>Seleccioná las comisiones que querés incluir en las combinaciones posibles</p>
        </div>

        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
          {validCommissions.map((commission) => (
            <button
              key={commission.name}
              onClick={() => handleCommissionToggle(commission.name)}
              className={`w-full px-4 py-3 rounded-lg text-left transition-colors flex flex-col ${
                selectedCommissions.includes(commission.name)
                  ? "bg-primary text-white"
                  : "bg-secondaryBackground hover:brightness-95"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span>Comisión {commission.name}</span>
                {selectedCommissions.includes(commission.name) && (
                  <CheckIcon className="h-5 w-5" />
                )}
              </div>
              <div className={`text-sm mt-1 whitespace-pre-line ${
                selectedCommissions.includes(commission.name)
                  ? "text-white"
                  : "text-gray"
              }`}>
                {formatSchedule(commission.schedule)}
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center gap-3 pt-4">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 text-textDefault hover:text-primary rounded-lg bg-secondaryBackground"
          >
            Agregar todas
          </button>
          <button
            onClick={handleAddCommissions}
            disabled={selectedCommissions.length === 0}
            className={`px-4 py-2 rounded-lg ${
              selectedCommissions.length === 0
                ? "bg-gray/20 text-gray cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            Agregar {selectedCommissions.length} {selectedCommissions.length !== 1 ? 'comisiones' : 'comisión'}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default CommissionSelectionModal; 