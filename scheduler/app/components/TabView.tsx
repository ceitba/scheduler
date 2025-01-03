import React, { useState } from 'react';

interface TabViewProps {
  tabs: {
    label: string;
    content: React.ReactNode;
    onClick?: () => void; 
  }[];
}

const TabView: React.FC<TabViewProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full relative">
      {/* Tab Navigation */}
      <div className="flex w-full bg-secondaryBackground p-1.5 rounded-xl relative">
        {/* Sliding Background */}
        <div
          className="absolute h-[calc(100%-12px)] top-1.5 transition-all duration-200 ease-out rounded-lg bg-primary"
          style={{
            width: `calc(${100 / tabs.length}% - 12px)`,
            left: `calc(${(100 / tabs.length) * activeTab}% + 6px)`,
            right: activeTab === tabs.length - 1 ? '6px' : 'auto',
          }}
        />
        
        {/* Tab Buttons */}
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveTab(index);
              if (tab.onClick) tab.onClick();
            }}
            className={`
              relative flex-1 px-4 py-3 text-sm font-medium rounded-lg
              transition-colors duration-200 ease-out z-10 select-none
              ${activeTab === index 
                ? 'text-white' 
                : 'text-gray hover:text-textDefault'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`
              transform transition-all duration-200 ease-out
              ${activeTab === index 
                ? 'opacity-100 translate-y-0' 
                : 'hidden'
              }
            `}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabView; 