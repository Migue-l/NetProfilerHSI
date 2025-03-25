import React, { useState, useEffect, useRef } from 'react';
import HSI_logo from '../assets/photos/HSI_logo.png';
import FGCU_logo from '../assets/photos/FGCU_logo.png';
import PlusAdd from '../assets/icons/PlusAdd.png';
import DeckOfCards from '../assets/icons/DeckofCards.png';
import CSVicon from '../assets/icons/CSVicon.png';
import PDFicon from '../assets/icons/PDFicon.png';

const Sidebar = ({
    activeTab,
    newCardData,
    setNewCardData,
    selectedDirectory,
    availableDecks,
    onRefresh,
    setOpenCards,
    setActiveCardIndex,  // Add this line
    setActiveTab,
}) => {
    const [cardName, setCardName] = useState('');
    const [cardTitle, setCardTitle] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [scrollBoxData, setScrollBoxData] = useState([]);
    const [selectedCsvItem, setSelectedCsvItem] = useState(null);
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Reset location when directory changes
    useEffect(() => {
        setSelectedLocation('');
    }, [selectedDirectory]);

    const fetchCsvData = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/get-csv-data");
            const result = await response.json();
            if (response.ok) {
                console.log("Fetched CSV Data:", result.names);
                setScrollBoxData(result.names || []);
            } else {
                console.error("Error fetching CSV data:", result.error);
            }
        } catch (error) {
            console.error("Error fetching CSV data:", error);
        }
    };

    useEffect(() => {
        fetchCsvData();
    }, []);

    const handleCsvItemClick = async (item) => {
        console.log("Creating card for:", item);

        try {
            const response = await fetch('http://127.0.0.1:5000/api/create-card-from-csv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: item })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create card");
            }

            const result = await response.json();

            // Add to open cards and refresh
            setOpenCards(prev => [...prev, {
                name: result.cardName,
                details: {
                    title: item,
                    type: "CSV Card",
                    ...result.data
                },
                selectedCategory: "Personal",
                subcatValues: result.subcategories
            }]);

            setActiveCardIndex(openCards.length);
            setActiveTab("Editor");
            onRefresh();

        } catch (error) {
            console.error("Error creating card:", error);
            alert(`Error creating card: ${error.message}`);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        setSelectedFile(file);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://127.0.0.1:5000/api/upload-csv", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                console.log("File uploaded successfully:", result);
                alert("File uploaded successfully!");
                fetchCsvData();
            } else {
                console.error("Error response from backend:", result);
                alert(result.error);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const fetchNewCardData = async () => {
        if (!cardTitle.trim()) {
            alert("Card title is required.");
            return;
        }
        const uniqueCardName = `Net-Card-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}`;
        try {
            const response = await fetch('http://127.0.0.1:5000/api/new-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cardName: uniqueCardName,
                    title: cardTitle,
                    location: selectedLocation || "",
                    createdAt: new Date().toISOString()
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create card: ${errorText}`);
            }
            const data = await response.json();
            alert(`Card Created: ${data.cardName}\nTitle: ${cardTitle}\nSaved at: ${data.filePath}`);
            setNewCardData(data.message);
            onRefresh();
        } catch (error) {
            console.error('Error creating new card:', error);
            alert('Failed to create new card.');
        }
    };

    const fetchNewDeckData = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/new-deck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deckName: `New-Deck-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}`,
                    location: selectedLocation || ""
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create deck: ${errorText}`);
            }
            const data = await response.json();
            alert(`Deck Created: ${data.deckName}\nSaved at: ${data.filePath}`);
            onRefresh();
        } catch (error) {
            console.error('Error creating new deck:', error);
            alert('Failed to create new deck.');
        }
    };

    return (
        <div className="sidebar">
            {activeTab === 'My Cards' && (
                <div>
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search for Card"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                    />
                    <input
                        type="text"
                        className="card-title-input"
                        placeholder="Enter Card Title"
                        value={cardTitle}
                        onChange={(e) => setCardTitle(e.target.value)}
                    />
                    <select
                        className="location-dropdown"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                        <option value="">Select Card Location</option>
                        {availableDecks.map((deck, index) => (
                            <option key={index} value={deck}>{deck}</option>
                        ))}
                    </select>
                    <div className="card-button-container">
                        <button className="new-card-button" onClick={fetchNewCardData}>
                            <img alt="add" className="plus_sign" src={PlusAdd} />
                            New Card
                        </button>
                        <button className="new-deck-button" onClick={fetchNewDeckData}>
                            <img alt="deck" className="deck_of_cards" src={DeckOfCards} />
                            New Deck
                        </button>
                    </div>
                </div>
            )}
            {activeTab === 'Editor' && (
                <div className="editor-sidebar">
                    <div className="import-export-container">
                        <button className="import-export-button" onClick={handleImportClick}>
                            <img alt="csv icon" className="csv-icon" src={CSVicon} />
                            Import File
                        </button>
                        <button className="import-export-button">
                            <img alt="pdf icon" className="pdf-icon" src={PDFicon} />
                            Export File
                        </button>
                    </div>
                    <div className="scrollable-box">
                        <h3>CSV Entries:</h3>
                        <div className="csv-list">
                            {scrollBoxData.map((name, index) => (
                                <div key={index} className={`csv-item ${selectedCsvItem === name ? 'selected' : ''}`} onClick={() => handleCsvItemClick(name)}>
                                    {name}
                                </div>
                            ))}
                        </div>
                    </div>
                    <input
                        type="file"
                        accept=".csv"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                </div>
            )}
        </div>
    );
};

export default Sidebar;