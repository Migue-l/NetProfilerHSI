import React, { useState } from 'react';
import useServerResponse from '../../../hooks/useServerResponse'

// newCardData imported as param to render in MainContent window
const MainContent = ({ activeTab, newCardData, setSelectedDirectory, setDecks}) => {
  const [csvData, setCsvData] = useServerResponse('Waiting for csv data...');
  const [selectedDirectory, setLocalSelectedDirectory] = useState('');
  const [entries, setEntries] = useState([]);
  const [expandedDecks, setExpandedDecks] = useState({});

// needed to render content in editor
  const [activeEditorCard, setActiveEditorCard] = useState('New Card 1');
  const [categories, setCategories] = useState(["Category 1", "Category 2"]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategory, setNewCategory] = useState("");

  const addCategory = () => {
    if (newCategory.trim() !== "") {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };
  
  //   const fetchCsvData = async () => {
//     try {
//       // Check for server response, assign to local var
//       const response = await fetch('http://127.0.0.1:5000/api/csv-test', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       });
//
//       // Debug code
//       console.log('Response Status:', response.status);
//       console.log('Response Headers:', response.headers);
//
//       // Checks for HTTP error
//       if (!response.ok) {
//         // Read full error message from Flask
//         const errorText = await response.text();
//         throw new Error(`${errorText} Status: ${response.status}`);
//       }
//
//       // Code seems to stop executing right here
//       console.log('HTTP Response OK');
//
//       const data = await response.json();
//       console.log('Fetched csv data:', data);
//
//       const csvText = csvToText(data);
//       setCsvData(csvText);
//
//     } catch (error) {
//       // Debug code: Err not visible during normal operation
//       console.error('Error fetching CSV data.', error);
//       // Display error message in main content window
//       setCsvData('Error fetching CSV data.');
//     }
//   };
//
//   // Convert JSON data into a formatted CSV-like text display
//   const csvToText = (jsonData) => {
//     // Check if input data is in a valid json format
//     if (!jsonData || !jsonData.columns || !jsonData.data) return 'Invalid data format';
//
//     // Generate the header row (column names)
//     const header = jsonData.columns.join(' | ');
//
//     // Print line to separate headers and rows
//     const separator = '-'.repeat(header.length);
//
//     // Convert each row into a formatted string
//     const rows = jsonData.data.map(row => row.join(' | ')).join('\n');
//
//     // Combine all parts into the final formatted text
//     return `${header}\n${separator}\n${rows}`;
// };

  // Fetch and set directory, decks, and entries
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
      console.log('Selected Directory:', data.directory);
      console.log('Decks:', JSON.stringify(data.decks));
      console.log('Directory Structure:', JSON.stringify(data.entries, null, 2));

      setSelectedDirectory(data.directory); // Update global selected directory
      setDecks(data.decks || []);  // Update global decks state
      setEntries(data.entries || {});  // Store file structure

    } catch (error) {
      console.error('Error selecting directory:', error);
    }
  };

  // **Define refreshDirectory function** 
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
        console.log('Refreshed Directory Structure:', JSON.stringify(data.entries, null, 2));

        if (!data.entries) {
            throw new Error("No entries returned from the server.");
        }

        setEntries(data.entries); // Store as an object, not an array

    } catch (error) {
        console.error('Error refreshing directory:', error);
    }
  };


   // Toggle deck expansion state
  const toggleDeck = (deckName) => {
    setExpandedDecks((prev) => ({
      ...prev,
      [deckName]: !prev[deckName]  // Toggle state for deckName
    }));
  };

  const renderEntries = (entries, parentPath = '') => {
    // Sort entries: Decks first, then Cards
    const sortedEntries = Object.entries(entries).sort((a, b) => {
        const isADeck = a[1]?.type === "Deck" ? -1 : 1;
        const isBDeck = b[1]?.type === "Deck" ? -1 : 1;
        return isADeck - isBDeck;
    });

    return sortedEntries.map(([name, details]) => {
        console.log(`Rendering: ${name}`, details); // Debugging output
        const deckPath = parentPath ? `${parentPath}/${name}` : name;

        return (
            <div key={deckPath} className="entry-wrapper">
                {details && details.type === "Deck" ? (
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
                    <button className="entry-card">
                        {name} ({details?.type || "Unknown"})
                    </button>
                )}
            </div>
        );
    });
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

          <div className="entries-container">{renderEntries(entries)}</div>
        </div>
      )}

      {activeTab === "Editor" && (
        <header className="editor-card-header">
          <div
            className={`editor-card-tab ${activeEditorCard === "New Card 1" ? "active" : ""}`}
            onClick={() => setActiveEditorCard("New Card 1")}
          >
            New Card 1
          </div>

          <div
            className={`editor-card-tab ${activeEditorCard === "New Card 2" ? "active" : ""}`}
            onClick={() => setActiveEditorCard("New Card 2")}
          >
            New Card 2
          </div>
        </header>
      )}

      {activeTab==="Editor" && activeEditorCard === "New Card 1" && (
        <div className="editor-container">
          <div className="categories-container">
            <div className="categories-list">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className="category-button"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="add-category">
              <input
                type="text"
                placeholder="New category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button onClick={addCategory}>+</button>
            </div>
          </div>

          <div className="category-editing-panel">
            Editing {selectedCategory}
           </div>
        </div>
      )}

      {activeTab === 'Settings' && (
        <div className="settings-container">
          <div className="indivdual-settings-containers">Always save to default location
            <label class="container">
              <input type="checkbox"/>
              <span class="checkmark"></span>
            </label>
          </div>

          <div className="indivdual-settings-containers"><b>Change Defaults: </b>
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

          <div className="indivdual-settings-containers"><b>Batch Exports:</b>
            <div class="text" className="settings-text">Prompt for each file save
            <label class="container">
                <input type="checkbox"/>
                <span class="checkmark"></span>
              </label>
            </div>
             <div className="settings-text">Run in background
              <label class="container">
                <input type="checkbox"/>
                <span class="checkmark"></span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;