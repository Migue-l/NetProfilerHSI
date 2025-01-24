import React, { useState } from 'react';
import TabHeader from './components/TabHeader.jsx';
import Sidebar from './components/Sidebar.jsx';
import MainContent from './components/MainContent.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('My Cards');
  const [serverResponse, setServerResponse] = useState(''); // State for server response


  return (
    <div className="app-container">
      <TabHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="content-container">
          <Sidebar activeTab={activeTab} setServerResponse={setServerResponse} /> {/* Pass setter */}
          <MainContent activeTab={activeTab} serverResponse={serverResponse} /> {/* Pass response */}
      </div>
    </div>
  );
};

export default App;