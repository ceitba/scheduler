import React, { useState } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface HeartButtonProps {
  initialState?: boolean;
  onToggle?: (isFilled: boolean) => void;
}

const HeartButton: React.FC<HeartButtonProps> = ({ initialState = false, onToggle }) => {
  const [isFilled, setIsFilled] = useState(initialState);

  const handleClick = () => {
    const newState = !isFilled;
    setIsFilled(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className="focus:outline-none"
      aria-label={isFilled ? "Unlike" : "Like"}
    >
      {isFilled ? (
        <HeartIconSolid className="h-5 w-5 text-red-500" />
      ) : (
        <HeartIcon className="h-5 w-5 hover:text-red-500" />
      )}
    </button>
  );
};

export default HeartButton;