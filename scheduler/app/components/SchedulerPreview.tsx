import React from 'react';
import WarningText from './WarningText';
import { 
  ArrowDownTrayIcon,
  ShareIcon,
  Cog6ToothIcon,
  PhotoIcon,
  CalendarDaysIcon,
  ArrowRightCircleIcon,
  ArrowLeftCircleIcon
} from '@heroicons/react/24/outline';

export const SchedulerPreview: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <WarningText message="Esta función estará disponible próximamente" />

      {/* Schedule Preview */}
      <div className="bg-background rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray/20">
          <h2 className="text-lg font-medium">Vista previa del horario</h2>
          <div>
            <button className="p-2 text-gray hover:bg-secondaryBackground rounded-lg">
              <ArrowLeftCircleIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray hover:bg-secondaryBackground rounded-lg">
              <ArrowRightCircleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-4">
          {/* Empty state preview */}
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray/20 rounded-lg">
            <div className="text-center text-gray mb-4">
              <CalendarDaysIcon className="h-8 w-8 mx-auto mb-2" />
              <p>No hay horarios generados</p>
            </div>
            
            {/* Run Algorithm Button */}
            <button className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <Cog6ToothIcon className="h-5 w-5" />
              <span>Generar Horarios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-background rounded-lg shadow-sm">
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button className="w-full flex items-center p-3 rounded-lg
            bg-secondaryBackground hover:bg-gray/10 transition-colors text-left">
            <div className="flex items-center">
              <ArrowDownTrayIcon className="h-5 w-5 mr-3 text-gray" />
              <div>
                <div className="font-medium">Descargar PDF</div>
                <div className="text-sm text-gray">Formato para imprimir</div>
              </div>
            </div>
          </button>

          <button className="w-full flex items-center p-3 rounded-lg
            bg-secondaryBackground hover:bg-gray/10 transition-colors text-left">
            <div className="flex items-center">
              <PhotoIcon className="h-5 w-5 mr-3 text-gray" />
              <div>
                <div className="font-medium">Descargar imagen</div>
                <div className="text-sm text-gray">Formato PNG</div>
              </div>
            </div>
          </button>

          <button className="w-full flex items-center p-3 rounded-lg
            bg-secondaryBackground hover:bg-gray/10 transition-colors text-left">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-5 w-5 mr-3 text-gray" />
              <div>
                <div className="font-medium">Google Calendar</div>
                <div className="text-sm text-gray">Exportar eventos y horarios</div>
              </div>
            </div>
          </button>

          <button className="w-full flex items-center p-3 rounded-lg
            bg-secondaryBackground hover:bg-gray/10 transition-colors text-left">
            <div className="flex items-center">
              <ShareIcon className="h-5 w-5 mr-3 text-gray" />
              <div>
                <div className="font-medium">Compartir</div>
                <div className="text-sm text-gray">Enviar por cualquier medio</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};