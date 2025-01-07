import React from 'react';

interface ClickeableIconProps {
    icon: React.ReactNode;
    text?: string;
    onClick: () => void;
}

const ClickeableIcon: React.FC<ClickeableIconProps> = ({ icon, text, onClick }) => {
    return (
        <button
            className="flex items-center justify-center rounded-full p-2 hover:bg-secondaryBackground 
            transition duration-300 focus:outline-none active:ring-2 
            active:ring-offset-2 active:ring-secondaryBackground active:transition active:duration-300"
            onClick={onClick}
        >
            {text && <span className="mr-2 hidden md:inline">{text}</span>}
            {icon}
        </button>
    );
};

export default ClickeableIcon;