import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';

const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Configuración</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondaryBackground rounded-lg">
            <span>Tema</span>
            <ThemeSwitcher />
          </div>
          {/* Add more settings as needed */}
        </div>
      </div>
    </div>
  );
};

export default SettingsView; 