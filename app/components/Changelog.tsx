import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '1.1.0',
    date: '12/1/2024',
    changes: [
      'Agregado registro de cambios',
    //   'Agregada sección de preguntas frecuentes',
      'Nueva opción de superposición ilimitada',
      'Actualizado ícono de Bioingeniería',
      'Arreglos menores a la aplicación'
    ]
  }
];

const Changelog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:text-primary underline flex items-center gap-1 transition-colors text-xs sm:text-sm"
      >
        Changelog
        <ChevronDownIcon 
          className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 sm:right-auto w-64 bg-background border border-gray/20 rounded-lg shadow-lg p-3 text-sm z-50">
          {changelog.map((entry, index) => (
            <div key={entry.version} className={index > 0 ? 'mt-4' : ''}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-textDefault">v{entry.version}</span>
                <span className="text-xs text-gray">{entry.date}</span>
              </div>
              <ul className="space-y-1">
                {entry.changes.map((change, i) => (
                  <li key={i} className="text-xs text-gray">
                    • {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Changelog; 