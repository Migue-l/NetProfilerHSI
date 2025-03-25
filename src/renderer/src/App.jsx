import React, { useState } from 'react';
import TabHeader from './components/TabHeader.jsx';
import Sidebar from './components/Sidebar.jsx';
import MainContent from './components/MainContent.jsx';
import useServerResponse from '../../hooks/useServerResponse';

function App() {
    const [activeTab, setActiveTab] = useState("My Cards");
    const [newCardData, setNewCardData] = useServerResponse("No cards created.");
    const [selectedDirectory, setSelectedDirectory] = useState("");
    const [decks, setDecks] = useState([]); // Define decks state at App level
    const [refreshKey, setRefreshKey] = useState(0); // refresh key for main directory refresh

    const [openCards, setOpenCards] = useState([]);
    const [activeCardIndex, setActiveCardIndex] = useState(null);

    // function to refresh
    const handleRefresh = () => {
        setRefreshKey((prevKey) => prevKey + 1);
    };

    return (
        <div className="app-container">
            <TabHeader activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="content-container">
                <Sidebar
                    activeTab={activeTab}
                    newCardData={newCardData}
                    setNewCardData={setNewCardData}
                    selectedDirectory={selectedDirectory}
                    availableDecks={decks}
                    onRefresh={handleRefresh}
                    setOpenCards={setOpenCards}
                    setActiveCardIndex={setActiveCardIndex}  // Add this line
                    setActiveTab={setActiveTab}
                />
                <MainContent
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    newCardData={newCardData}
                    setSelectedDirectory={setSelectedDirectory}
                    setDecks={setDecks} // Pass setter function to update decks in App
                    refreshKey={refreshKey} // passing refreshKey as a prop
                    openCards={openCards}  // Pass new states
                    setOpenCards={setOpenCards}
                    activeCardIndex={activeCardIndex}
                    setActiveCardIndex={setActiveCardIndex}
                />
            </div>
        </div>
    );
}

export default App;