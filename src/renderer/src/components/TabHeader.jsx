import React from 'react';
import Settings from '../assets/icons/Settings.png';

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
      <div
        className={`tab ${activeTab === 'Settings' ? 'active' : ''} settings-tab`}
        onClick={() => setActiveTab('Settings')}
      > 
        <img alt="add image" className="settings-icon" src={Settings} />
      </div>
    </header>
  );
};

export default TabHeader;