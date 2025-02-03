import React, { useState } from 'react';
import TabHeader from './components/TabHeader.jsx';
import Sidebar from './components/Sidebar.jsx';
import MainContent from './components/MainContent.jsx';
import useServerResponse from '../../hooks/useServerResponse';

function App() {
  const [activeTab, setActiveTab] = useState('My Cards');
  const [newCardData, setNewCardData] = useServerResponse('No cards created.');
  const [selectedDirectory, setSelectedDirectory] = useState('');
  const [decks, setDecks] = useState([]); // Define decks state at App level

  return (
    <div className="app-container">
      <TabHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="content-container">
        <Sidebar
          activeTab={activeTab}
          newCardData={newCardData}
          setNewCardData={setNewCardData}
          selectedDirectory={selectedDirectory}
          availableDecks={decks}  // Now correctly passing decks
        />
        <MainContent
          activeTab={activeTab}
          newCardData={newCardData}
          setSelectedDirectory={setSelectedDirectory}
          setDecks={setDecks}  // Pass setter function to update decks in App
        />
      </div>
    </div>
  );
}

export default App;
