import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorViewProps {
  message?: string;
  className?: string;
}

const ErrorView: React.FC<ErrorViewProps> = ({ 
  message = "Oops, hubo un problema", 
  className = "" 
}) => {
    console.log(message);
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-textDefault mb-2">
        Oops, hubo un problema
      </h3>
      <p className="text-sm text-gray text-center">
        Por favor, intentá de nuevo más tarde o contactá al equipo de IT si el problema persiste.
      </p>
    </div>
  );
};

export default ErrorView; 