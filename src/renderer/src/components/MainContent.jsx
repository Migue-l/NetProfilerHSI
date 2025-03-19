import React, { useState, useEffect } from 'react';
import useServerResponse from '../../../hooks/useServerResponse';

const MainContent = ({ activeTab, newCardData, setSelectedDirectory, setDecks, setActiveTab, refreshKey }) => {
    const [csvData, setCsvData] = useServerResponse('Waiting for csv data...');
    const [selectedDirectory, setLocalSelectedDirectory] = useState('');
    const [entries, setEntries] = useState([]);
    const [expandedDecks, setExpandedDecks] = useState({});

    // Instead of a single selectedCard, we maintain an array of open cards
    const [openCards, setOpenCards] = useState([]);
    const [activeCardIndex, setActiveCardIndex] = useState(null);

    const fetchCsvContent = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/get-csv-data`);
            if (!response.ok) {
                throw new Error(`Failed to fetch CSV. Status: ${response.status}`);
            }
            const data = await response.json();
            console.log("CSV Data Response:", data);
            if (!data.data || data.data.length === 0) {
                return 'Error: Empty CSV file.';
            }
            return csvToText(data);
        } catch (error) {
            console.error('Error fetching CSV file:', error);
            return `Error loading CSV file: ${error.message}`;
        }
    };

    const csvToText = (jsonData) => {
        if (!jsonData || !jsonData.columns || !jsonData.data) return 'Invalid data format';
        const header = jsonData.columns.join(' | ');
        const separator = '-'.repeat(header.length);
        const rows = jsonData.data.map(row => jsonData.columns.map(col => row[col]).join(' | ')).join('\n');
        return `${header}\n${separator}\n${rows}`;
    };

    const [categories, setCategories] = useState(["Personal", "Contact", "Immigration", "Vehicle", "Affiliation", "Criminal"]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState("");

    const handleCategoryChange = (e) => {
        setNewCategory(e.target.value);
    };

    const addCategory = () => {
        const trimmedInput = newCategory.trim().substring(0, 20);
        const validFormat = /^[a-zA-Z0-9-_\s]+$/.test(trimmedInput);
        if (validFormat) {
            setCategories([...categories, trimmedInput]);
            setNewCategory("");
            setIsAddingCategory(false);
        } else {
            alert("Invalid category name. Only letters, numbers, '-', and '_' are allowed.");
        }
    };

    const deleteCategory = (categoryToDelete) => {
        setCategories(categories.filter(category => category !== categoryToDelete));
    };

    const selectRootDirectory = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/select-directory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                throw new Error('Failed to open file explorer');
            }
            const data = await response.json();
            setSelectedDirectory(data.directory);
            setDecks(data.decks || []);
            setEntries(data.entries || {});
        } catch (error) {
            console.error('Error selecting directory:', error);
        }
    };

    const refreshDirectory = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/refresh-directory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                throw new Error('Failed to refresh directory');
            }
            const data = await response.json();
            if (!data.entries) {
                throw new Error("No entries returned from the server.");
            }
            setEntries(data.entries);
        } catch (error) {
            console.error('Error refreshing directory:', error);
        }
    };

    useEffect(() => {
        refreshDirectory();
    }, [refreshKey]);

    const toggleDeck = (deckName) => {
        setExpandedDecks((prev) => ({
            ...prev,
            [deckName]: !prev[deckName]
        }));
    };

    const handleCardClick = async (cardName, details) => {
        console.log(`Clicked card: ${cardName}`, details);
        // Check if the card is already open
        const existingIndex = openCards.findIndex(card => card.name === cardName);
        let newOpenCards = [...openCards];
        let newActiveIndex = activeCardIndex;
        if (existingIndex === -1) {
            const newCard = { name: cardName, details };
            newOpenCards.push(newCard);
            newActiveIndex = newOpenCards.length - 1;
        } else {
            newActiveIndex = existingIndex;
        }
        setOpenCards(newOpenCards);
        setActiveCardIndex(newActiveIndex);

        // Always fetch CSV data when a card is clicked
        const csvContent = await fetchCsvContent();
        console.log(`CSV Content Received:`, csvContent);
        setCsvData(csvContent);

        setActiveTab("Editor");
    };

    const renderEntries = (entries, parentPath = '') => {
        const sortedEntries = Object.entries(entries).sort((a, b) => {
            return (a[1]?.type === "Deck" ? -1 : 1) - (b[1]?.type === "Deck" ? -1 : 1);
        });

        return sortedEntries.map(([name, details]) => {
            console.log("Rendering card details for:", name, details);
            const deckPath = parentPath ? `${parentPath}/${name}` : name;
            return (
                <div key={deckPath} className="entry-wrapper">
                    {details?.type === "Deck" ? (
                        <>
                            <button className="entry-card deck-button" onClick={() => toggleDeck(deckPath)}>
                                {name} (Deck) {expandedDecks[deckPath] ? "▲" : "▼"}
                            </button>
                            {expandedDecks[deckPath] && details.contents && (
                                <div className="nested-entries">
                                    {renderEntries(details.contents, deckPath)}
                                </div>
                            )}
                        </>
                    ) : (
                        <button className="entry-card" onClick={() => handleCardClick(name, details)}>
                            {details?.title ? details.title : name} ({details?.type || "Unknown"})
                        </button>
                    )}
                </div>
            );
        });
    };

    const handleTabClick = (index) => {
        setActiveCardIndex(index);
    };

    const closeTab = (index, e) => {
        e.stopPropagation();
        const updatedCards = openCards.filter((_, i) => i !== index);
        setOpenCards(updatedCards);
        if (activeCardIndex === index) {
            setActiveCardIndex(updatedCards.length > 0 ? 0 : null);
        } else if (activeCardIndex > index) {
            setActiveCardIndex(activeCardIndex - 1);
        }
    };

    const handlePreviewClick = () => {
        if (activeCardIndex !== null && openCards[activeCardIndex]) {
            const card = openCards[activeCardIndex];
            const cardDetails = JSON.stringify(card);
            const previewWindow = window.open('blank', '_blank');
            if (previewWindow) {
                previewWindow.document.write(`
                    <html>
                      <head>
                        <title>Preview Card</title>
                      </head>
                      <body>
                        <h1>Preview Card: ${card.name}</h1>
                        <p><b>Details:</b> ${card.details}</p>
                        <p><b>CSV Content:</b></p>
                        <pre>${csvData}</pre>
                      </body>
                    </html>
                `);
                previewWindow.document.close();
            }
        }
    };

    return (
        <div className="main-content">
            {activeTab === "My Cards" && (
                <div>
                    <button onClick={selectRootDirectory} className="select-dir-button">
                        Select Root Directory
                    </button>
                    <button onClick={refreshDirectory} className="refresh-dir-button">
                        Refresh Directory
                    </button>
                    {selectedDirectory && <p>Selected Directory: {selectedDirectory}</p>}
                    <div className="entries-container">
                        {renderEntries(entries)}
                    </div>
                </div>
            )}

            {activeTab === "Editor" && (
                <>
                    {/* Editor Tab Header */}
                    <header className="editor-card-header">
                        {openCards.map((card, index) => (
                            <div
                                key={index}
                                className={`editor-card-tab ${index === activeCardIndex ? "active" : ""}`}
                                onClick={() => handleTabClick(index)}
                            >
                                {card.details.title || card.name}
                                <button onClick={(e) => closeTab(index, e)}>x</button>
                            </div>
                        ))}
                    </header>

                    {/* Editor Body */}
                    <div className="editor-container">
                        {activeCardIndex !== null && openCards[activeCardIndex] ? (
                            <>
                                <div className="categories-container">
                                    <div className="add-category">
                                        {isAddingCategory ? (
                                            <div className="add-category">
                                                <input
                                                    type="text"
                                                    placeholder="Enter category name"
                                                    value={newCategory}
                                                    onChange={handleCategoryChange}
                                                    maxLength={20}
                                                />
                                                <button onClick={addCategory}>OK</button>
                                                <button onClick={() => setIsAddingCategory(false)}>Cancel</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setIsAddingCategory(true)}>+</button>
                                        )}
                                    </div>
                                    <div className="categories-list">
                                        {categories.map((category, idx) => (
                                            <div key={idx} className="category-item">
                                                <button
                                                    className="category-button"
                                                    onClick={() => setSelectedCategory(category)}
                                                >
                                                    {category}
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => deleteCategory(category)}
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="category-editing-panel">
                                    Editing {selectedCategory}
                                    <button className="preview-button" onClick={handlePreviewClick}>
                                        Preview Card
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p>Please select a card from "My Cards" to edit.</p>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'Settings' && (
                <div className="settings-container">
                    <div className="indivdual-settings-containers">
                        Always save to default location
                        <label className="container">
                            <input type="checkbox" />
                            <span className="checkmark"></span>
                        </label>
                    </div>
                    <div className="indivdual-settings-containers">
                        <b>Change Defaults: </b>
                        <div className="settings-text">Default export location:</div>
                        <button className="choose-export-or-deck">
                            C:\Users\...
                        </button>
                        <div className="settings-text">Always save new cards to:</div>
                        <button className="choose-export-or-deck">
                            Choose a Deck
                        </button>
                        <div className="settings-text">Default card categories:</div>
                        <input
                            type="text"
                            className="default-categories"
                            placeholder="Personal, Contact, Immigration, Vehicle, Affiliation, Criminal, Case Notes"
                        />
                    </div>
                    <div className="indivdual-settings-containers">
                        <b>Batch Exports:</b>
                        <div className="settings-text">
                            Prompt for each file save
                            <label className="container">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                            </label>
                        </div>
                        <div className="settings-text">
                            Run in background
                            <label className="container">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainContent;
