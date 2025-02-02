import React, { useState } from 'react';
import TabHeader from './components/TabHeader.jsx';
import Sidebar from './components/Sidebar.jsx';
import MainContent from './components/MainContent.jsx';
import useServerResponse from '../../hooks/useServerResponse'

function App() {
  const [activeTab, setActiveTab] = useState('My Cards');
  // New card state tuple declared here bc it is accessed by MainContent.jsx & Sidebar.jsx
  const [newCardData, setNewCardData] = useServerResponse('No cards created.');
  return (
    <div className="app-container">
      <TabHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="content-container">
          <Sidebar activeTab={activeTab} newCardData={newCardData} setNewCardData={setNewCardData}/>
          <MainContent activeTab={activeTab} newCardData={newCardData}/>
      </div>
    </div>
  );
};

export default App;