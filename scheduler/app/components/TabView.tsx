import React, { useState } from 'react';

interface TabViewProps {
  tabs: {
    label: string;
    content: React.ReactNode;
  }[];
}

const TabView: React.FC<TabViewProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full">
      <div className="flex w-full relative">
        <div className="absolute bottom-0 w-full border-b border-secondary" />
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`
              relative flex-1 px-4 py-3 text-sm sm:text-base font-medium
              ${activeTab === index 
                ? 'border-b-2 border-primary bg-gray/5 text-primary' 
                : 'text-default hover:bg-gray/5 hover:text-primary'
              }
            `}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default TabView; 