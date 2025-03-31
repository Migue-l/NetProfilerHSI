import React from 'react';

const TabHeader = ({ activeTab, setActiveTab }) => {
  console.log("TabHeader activeTab:", activeTab);
  return (
    <header className="tab-header">
      <div
        className={`tab ${activeTab === 'My Cards' ? 'active' : ''}`}
        onClick={() => setActiveTab('My Cards')}
      >
        My Cards
      </div>
      <div
        className={`tab ${activeTab === 'Editor' ? 'active' : ''}`}
        onClick={() => setActiveTab('Editor')}
      >
        Editor
      </div>
      <div
        className={`tab ${activeTab === 'Settings' ? 'active' : ''} settings-tab`}
        onClick={() => setActiveTab('Settings')}
      > 
        Settings
      </div>
    </header>
  );
};

export default TabHeader;