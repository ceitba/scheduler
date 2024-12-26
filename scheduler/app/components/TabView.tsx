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
      <div className="flex space-x-2 mb-4 border-b border-secondaryBackground">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`px-4 py-2 ${
              activeTab === index
                ? 'text-secondary border-b-2 border-secondary'
                : 'text-gray hover:text-textDefault'
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{tabs[activeTab].content}</div>
    </div>
  );
};

export default TabView; 