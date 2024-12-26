import React from 'react';
import WarningText from './WarningText';

const SchedulerPreview: React.FC = () => {
  return (
    <div className="space-y-4">
      <WarningText message="Esta función estará disponible próximamente" />
      <div className="bg-secondaryBackground p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Vista previa del horario</h2>
        {/* Add scheduler preview content here */}
      </div>
    </div>
  );
};

export default SchedulerPreview; 