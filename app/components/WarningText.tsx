import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const WarningText: React.FC<{ message: string }> = ({ message }) => {
    return (
        <div className="flex items-center bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <div className="mr-2 text-yellow-700"> 
                <ExclamationTriangleIcon className="h-5 w-5" />
            </div>
            <p>{message}</p>
        </div>
    );
};

export default WarningText;