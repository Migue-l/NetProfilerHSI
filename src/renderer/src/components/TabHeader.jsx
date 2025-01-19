import React from 'react';

const TabHeader = ({ activeTab, setActiveTab }) => {
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
    </header>
  );
};

export default TabHeader;