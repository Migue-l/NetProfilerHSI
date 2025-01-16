import React, { useState } from 'react';
import TabHeader from './components/TabHeader.jsx';
import Sidebar from './components/Sidebar.jsx';
import MainContent from './components/MainContent.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('My Cards');

  return (
    <div className="app-container">
      <TabHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="content-container">
        <Sidebar activeTab={activeTab} />
        <MainContent activeTab={activeTab} />
      </div>
    </div>
  );
};

export default App;