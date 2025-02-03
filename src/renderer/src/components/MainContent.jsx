import React, { useState } from 'react';
import useServerResponse from '../../../hooks/useServerResponse'

// newCardData imported as param to render in MainContent window
const MainContent = ({activeTab, newCardData}) => {

   const [csvData, setCsvData] = useServerResponse('Waiting for csv data...');
   const [selectedDirectory, setSelectedDirectory] = useState('');
   const [entries, setEntries] = useState([]);
   const [expandedDecks, setExpandedDecks] = useState({}); // Track expanded decks

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
        console.log('Directory Structure:', JSON.stringify(data.entries, null, 2)); // Log actual structure

        setSelectedDirectory(data.directory);
        setEntries(data.entries || {}); // Store raw object instead of array

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
        console.log('Refreshed Directory Structure:', JSON.stringify(data.entries, null, 2));

        if (!data.entries) {
            throw new Error("No entries returned from the server.");
        }

        setEntries(data.entries); // Store as an object, not an array

    } catch (error) {
        console.error('Error refreshing directory:', error);
    }
  };

  const toggleDeck = (deckPath) => {
    setExpandedDecks((prev) => ({
      ...prev,
      [deckPath]: !prev[deckPath] // Toggle state for deckPath
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
      {activeTab === 'My Cards' && (
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
      {activeTab === 'Editor' && (
          <div>
            This is the editor window
          </div>
      )}
    </div>
  );
};

export default MainContent;