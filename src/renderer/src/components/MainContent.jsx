import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom/client";
import CardPreview from "./CardPreview.jsx";
import useServerResponse from '../../../hooks/useServerResponse';

const MainContent = ({ activeTab, newCardData, setSelectedDirectory, setDecks, setActiveTab, refreshKey, openCards, setOpenCards, activeCardIndex, setActiveCardIndex }) => {
    const [csvData, setCsvData] = useServerResponse('Waiting for csv data...');
    const [selectedDirectory, setLocalSelectedDirectory] = useState('');
    const [entries, setEntries] = useState([]);
    const [expandedDecks, setExpandedDecks] = useState({});

    // openCards array stores objects of { name, details, selectedCategory, subcatValues }

    // States for category buttons (global list)
    const [categories, setCategories] = useState([
        "Personal", "Contact", "Immigration", "Vehicle", "Affiliation", "Criminal"
    ]);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState("");

    //  subcategories for each category
    const categorySubcategories = {
        Personal: ["First Name", "Last Name", "Alias", "DOB", "COB", "SSN", "Race", "Gender", "Height", "Weight", "Hair color", "Eye color", "Last Known Residence", "Employment"],
        Contact: ["Phone #", "Email Address", "Date SAR Checked"],
        Immigration: ["Passport (COC)", "Immigration Status", "SID #", "Travel"],
        Vehicle: ["Make", "Model", "Vehicle Tag #", "Color"],
        Affiliation: ["Social Media", "Associated Business"],
        Criminal: ["Suspected Role", "FBI #", "Active Warrants", "Criminal History", "SAR Activity", "Date SAR Checked", "Case #", "ROA #"]
    };

    console.log("MainContent rendered with tab:", activeTab);

    useEffect(() => {
        console.log("Current activeCardIndex:", activeCardIndex);
        console.log("Current openCards:", openCards);
    }, [activeCardIndex, openCards]);

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
        const rows = jsonData.data
            .map(row => jsonData.columns.map(col => row[col]).join(' | '))
            .join('\n');
        return `${header}\n${separator}\n${rows}`;
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
        setExpandedDecks(prev => ({
            ...prev,
            [deckName]: !prev[deckName]
        }));
    };

    const handleCardClick = async (cardName, details) => {
        console.log(`Clicked card: ${cardName}`, details);
        const existingIndex = openCards.findIndex(card => card.name === cardName);
        let newOpenCards = [...openCards];
        let newActiveIndex = activeCardIndex;
        if (existingIndex === -1) {
            const newCard = {
                name: cardName,
                details,
                selectedCategory: null,
                subcatValues: {}
            };
            newOpenCards.push(newCard);
            newActiveIndex = newOpenCards.length - 1;
        } else {
            newActiveIndex = existingIndex;
        }
        setOpenCards(newOpenCards);
        setActiveCardIndex(newActiveIndex);

        const csvContent = await fetchCsvContent();
        console.log(`CSV Content Received:`, csvContent);
        setCsvData(csvContent);
        setActiveTab("Editor");
    };

    const renderEntries = (entriesObj, parentPath = '') => {
        const sortedEntries = Object.entries(entriesObj).sort((a, b) => {
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

    // update selectedCategory when cat button is clickeds
    const handleCategoryClick = (cat) => {
        setOpenCards(prevCards => {
            const updatedCards = [...prevCards];
            if (updatedCards[activeCardIndex]) {
                updatedCards[activeCardIndex] = {
                    ...updatedCards[activeCardIndex],
                    selectedCategory: cat,
                    subcatValues: updatedCards[activeCardIndex].subcatValues || {}
                };
            }
            return updatedCards;
        });
    };

    // Update subcategory value for the active card.
    const handleSubcatChange = (cat, subcat, value) => {
        setOpenCards(prevCards => {
            const updatedCards = [...prevCards];
            if (updatedCards[activeCardIndex]) {
                const card = { ...updatedCards[activeCardIndex] };
                const currentCatData = card.subcatValues[cat] || {};
                currentCatData[subcat] = value;
                card.subcatValues[cat] = currentCatData;
                updatedCards[activeCardIndex] = card;
            }
            return updatedCards;
        });
    };

    // Save subcategory data for the active card. (api call)
    const handleSaveSubcatData = async () => {
        if (activeCardIndex === null || !openCards[activeCardIndex]) return;
        const currentCard = openCards[activeCardIndex];
        const subcatData = currentCard.subcatValues || {};

        try {
            const response = await fetch('http://127.0.0.1:5000/api/update-card-subcat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cardName: currentCard.name,
                    subcatData: subcatData
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update subcategories: ${errorText}`);
            }

            const result = await response.json();
            alert(`Subcategory data saved for ${currentCard.name}: ` + JSON.stringify(result.updatedData));

        } catch (error) {
            console.error("Error saving subcategory data:", error);
            alert("Error saving subcategory data: " + error.message);
        }
    };

    // preview card opening
  const handlePreviewClick = () => {
    if (openCards[activeCardIndex]) {
      const card = openCards[activeCardIndex];
      const PrevWin = window.open("", "_blank", "width=1920,height=1080");

      if (PrevWin) {
        PrevWin.cardData = card;

        const link = PrevWin.document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/src/assets/css/cardpreview.css";
        PrevWin.document.head.appendChild(link);

        PrevWin.document.body.innerHTML = "<div id='new-root'></div>";
        const root = ReactDOM.createRoot(
          PrevWin.document.getElementById("new-root")
        );

        // render component
        root.render(<CardPreview card={PrevWin.cardData} />);
      }
    }
    };

    const addCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
            setNewCategory("");
            setIsAddingCategory(false);
        }
    };

    const deleteCategory = (category) => {
        setCategories(categories.filter(c => c !== category));
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
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    const newTitle = window.prompt("Enter new title for this card:", card.details.title || card.name);
                                    if (newTitle !== null) {
                                        setOpenCards(prevCards => {
                                            const updatedCards = [...prevCards];
                                            if (updatedCards[index]) {
                                                const updatedCard = { ...updatedCards[index] };
                                                updatedCard.details.title = newTitle;
                                                updatedCards[index] = updatedCard;
                                            }
                                            return updatedCards;
                                        });
                                    }
                                }}
                            >
                                {card.details.title || card.name}
                                <button onClick={(e) => closeTab(index, e)}>x</button>
                            </div>
                        ))}
                    </header>

                    {/* Editor Body */}
                    <div className="editor-container">
                        {console.log("🧠 Current openCards:", openCards)}
                        {console.log("🧠 Current activeCardIndex:", activeCardIndex)}
                        {activeCardIndex !== null && openCards[activeCardIndex] && (
                            <>
                                {/* Regular Editor Content */}
                                <div className="categories-container">
                                    <div className="add-category">
                                        {isAddingCategory ? (
                                            <div className="add-category">
                                                <input
                                                    type="text"
                                                    placeholder="Enter category name"
                                                    value={newCategory}
                                                    onChange={(e) => setNewCategory(e.target.value)}
                                                    maxLength={20}
                                                />
                                                <button onClick={addCategory}>OK</button>
                                                <button onClick={() => setIsAddingCategory(false)}>Cancel</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setIsAddingCategory(true)}>New Category</button>
                                        )}
                                    </div>
                                    <div className="categories-list">
                                        {categories.map((category, idx) => (
                                            <div key={idx} className="category-item">
                                                <button
                                                    className="category-button"
                                                    onClick={() => handleCategoryClick(category)}
                                                >
                                                    {category}
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => {
                                                        setOpenCards(prevCards => {
                                                            const updatedCards = [...prevCards];
                                                            if (updatedCards[activeCardIndex]) {
                                                                const card = { ...updatedCards[activeCardIndex] };
                                                                if (card.selectedCategory === category) {
                                                                    card.selectedCategory = null;
                                                                }
                                                                if (card.subcatValues && card.subcatValues[category]) {
                                                                    const updatedSubcats = { ...card.subcatValues };
                                                                    delete updatedSubcats[category];
                                                                    card.subcatValues = updatedSubcats;
                                                                }
                                                                updatedCards[activeCardIndex] = card;
                                                            }
                                                            return updatedCards;
                                                        });
                                                        deleteCategory(category);
                                                    }}
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="category-editing-panel">
                                    <button className="preview-button" onClick={handlePreviewClick}>Preview Card</button>
                                    {openCards[activeCardIndex].selectedCategory ? (
                                        <>
                                            <h2>Editing {openCards[activeCardIndex].selectedCategory}</h2>
                                            {categorySubcategories[openCards[activeCardIndex].selectedCategory]?.map(subcat => {
                                                const currentValue = openCards[activeCardIndex].subcatValues?.[openCards[activeCardIndex].selectedCategory]?.[subcat] || "";
                                                return (
                                                    <div key={subcat} style={{ marginBottom: '8px' }}>
                                                        <label>
                                                            {subcat}:
                                                            <input
                                                                type="text"
                                                                value={currentValue}
                                                                onChange={e => handleSubcatChange(
                                                                    openCards[activeCardIndex].selectedCategory,
                                                                    subcat,
                                                                    e.target.value
                                                                )}
                                                                style={{ marginLeft: '8px' }}
                                                            />
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                            <button onClick={handleSaveSubcatData}>Save</button>
                                        </>
                                    ) : (
                                        <p>Please select a category to edit subcategories.</p>
                                    )}
                                </div>
                            </>
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