import React, { useState } from 'react';
import TabHeader from './components/TabHeader.jsx';
import Sidebar from './components/Sidebar.jsx';
import MainContent from './components/MainContent.jsx';
import useServerResponse from '../../hooks/useServerResponse';
import PromptModal from './components/PromptModal';

function App() {
    const [activeTab, setActiveTab] = useState("My Cards");
    const [newCardData, setNewCardData] = useServerResponse("No cards created.");
    const [selectedDirectory, setSelectedDirectory] = useState("");
    const [decks, setDecks] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [openCards, setOpenCards] = useState([]);
    const [activeCardIndex, setActiveCardIndex] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [currentCsvItem, setCurrentCsvItem] = useState(null);

    const handleRefresh = () => {
        setRefreshKey((prevKey) => prevKey + 1);
    };

    const handleCsvSelect = (csvItem) => {
        setCurrentCsvItem(csvItem);
        setShowModal(true);
    };

    const handleModalConfirm = async (cardTitle) => {
        try {
            if (!cardTitle) return; // User cancelled

            // Create a unique card name
            const cardName = `Net-Card-${Date.now()}`;

            // Create the new card with CSV data
            const response = await fetch('http://127.0.0.1:5000/api/new-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cardName: cardName,
                    title: cardTitle,
                    location: "", // You can modify this to use selected directory
                    createdAt: new Date().toISOString(),
                    csvData: currentCsvItem // Pass the CSV data
                }),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();

            // Add the new card to openCards
            const newCard = {
                name: cardName,
                details: {
                    type: "CSV Card",
                    title: cardTitle,
                    csvItem: currentCsvItem,
                    filePath: data.filePath
                },
                selectedCategory: null,
                subcatValues: {}
            };

            setOpenCards([...openCards, newCard]);
            setActiveCardIndex(openCards.length);
            setActiveTab("Editor");
            alert(`Card "${cardTitle}" created successfully!`);

        } catch (error) {
            console.error('Error creating CSV card:', error);
            alert('Failed to create card: ' + error.message);
        } finally {
            setShowModal(false);
        }
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
                    setActiveCardIndex={setActiveCardIndex}
                    setActiveTab={setActiveTab}
                    onCsvSelect={handleCsvSelect}
                />
                <MainContent
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    newCardData={newCardData}
                    setSelectedDirectory={setSelectedDirectory}
                    setDecks={setDecks}
                    refreshKey={refreshKey}
                    openCards={openCards}
                    setOpenCards={setOpenCards}
                    activeCardIndex={activeCardIndex}
                    setActiveCardIndex={setActiveCardIndex}
                />

                {/* Prompt Modal for CSV Card Creation */}
                <PromptModal
                    show={showModal}
                    title="Create Card from CSV"
                    message="Enter a title for this CSV card:"
                    defaultValue={currentCsvItem || ""}
                    onConfirm={handleModalConfirm}
                    onCancel={() => setShowModal(false)}
                />
            </div>
        </div>
    );
}

export default App;