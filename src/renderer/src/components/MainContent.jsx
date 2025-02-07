import React, { useState } from 'react';
import useServerResponse from '../../../hooks/useServerResponse';

const MainContent = ({ activeTab, newCardData, setSelectedDirectory, setDecks, setActiveTab }) => {
  const [csvData, setCsvData] = useServerResponse('Waiting for csv data...');
  const [selectedDirectory, setLocalSelectedDirectory] = useState('');
  const [entries, setEntries] = useState([]);
  const [expandedDecks, setExpandedDecks] = useState({});
  const [selectedCard, setSelectedCard] = useState(null);

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
  
      // Convert JSON to readable text format
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

  const toggleDeck = (deckName) => {
    setExpandedDecks((prev) => ({
      ...prev,
      [deckName]: !prev[deckName]
    }));
  };

  const handleCardClick = async (cardName, details) => {
    console.log(`Clicked card: ${cardName}`, details);
  
    setSelectedCard({ name: cardName, details });
  
    // Always fetch test.csv, no matter which card is clicked
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
      const deckPath = parentPath ? `${parentPath}/${name}` : name;

      return (
        <div key={deckPath} className="entry-wrapper">
          {details?.type === "Deck" ? (
            <>
              <button className="entry-card deck-button" onClick={() => toggleDeck(deckPath)}>
                {name} (Deck) {expandedDecks[deckPath] ? "▲" : "▼"}
              </button>
              {expandedDecks[deckPath] && details.contents && (
                <div className="nested-entries">{renderEntries(details.contents, deckPath)}</div>
              )}
            </>
          ) : (
            <button className="entry-card" onClick={() => handleCardClick(name, details)}>
              {name} ({details?.type || "Unknown"})
            </button>
          )}
        </div>
      );
    });
  };

  return (
    <div className="main-content">
      {activeTab === 'My Cards' && (
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
      {activeTab === 'Editor' && (
        <div>
          {selectedCard ? (
            <div>
              <h2>Editing: {selectedCard.name}</h2>
              <p>Type: {selectedCard.details.type}</p>
              <p>Details: {JSON.stringify(selectedCard.details, null, 2)}</p>
              <div>
                <h3>CSV Content:</h3>
                <pre className="csv-content">{csvData || 'Loading CSV data...'}</pre>
              </div>
            </div>
          ) : (
          <p>Select a card to edit</p>
        )}
      </div>
    )}
    </div>
  );
};

export default MainContent;
