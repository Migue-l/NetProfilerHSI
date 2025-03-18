import React, { useState, useEffect, useRef } from 'react';
import HSI_logo from '../assets/photos/HSI_logo.png';
import FGCU_logo from '../assets/photos/FGCU_logo.png';
import PlusAdd from '../assets/icons/PlusAdd.png';
import DeckOfCards from '../assets/icons/DeckofCards.png';
import CSVicon from '../assets/icons/CSVicon.png';
import PDFicon from '../assets/icons/PDFicon.png';

const Sidebar = ({ activeTab, newCardData, setNewCardData, selectedDirectory, availableDecks }) => {
  const [cardName, setCardName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [csvEntries, setCsvEntries] = useState([]); // State to hold CSV names
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState('');

  // State to hold data for the scrollable box
  const [scrollBoxData, setScrollBoxData] = useState([]);
  
  // State to hold the selected CSV item for highlighting
  const [selectedCsvItem, setSelectedCsvItem] = useState(null);

  // Reset location when directory changes
  useEffect(() => {
    setSelectedLocation('');
  }, [selectedDirectory]);

  const fetchNewCardData = async () => {
    const uniqueCardName = `Net-Card-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}`;

    try {
      const response = await fetch('http://127.0.0.1:5000/api/new-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardName: uniqueCardName, location: selectedLocation || "", createdAt: new Date().toISOString() }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create card: ${errorText}`);
      }

      const data = await response.json();
      alert(`Card Created: ${data.cardName}\nSaved at: ${data.filePath}`);
      setNewCardData(data.message);
    } catch (error) {
      console.error('Error creating new card:', error);
      alert('Failed to create new card.');
    }
  };

  const fetchNewDeckData = async () => {
    const uniqueDeckName = `Net-Deck-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}`;

    try {
      const response = await fetch('http://127.0.0.1:5000/api/new-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckName: uniqueDeckName, location: selectedLocation || "" }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create deck: ${errorText}`);
      }

      const data = await response.json();
      alert(`Deck Created: ${data.deckName}\nSaved at: ${data.filePath}`);
      setNewCardData(data.message);
    } catch (error) {
      console.error('Error creating new deck:', error);
      alert('Failed to create new deck.');
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Upload the selected file
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/upload-csv", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        alert("File uploaded successfully!");
        fetchCsvData(); // Refresh the scrollable box
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  // Fetch CSV data for scrollable box
  const fetchCsvData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/get-csv-data");
      const result = await response.json();
      if (response.ok) {
        setScrollBoxData(result.names || []);
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error("Error fetching CSV data:", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchCsvData();
  }, []);

  const handleCsvItemClick = (item) => {
    console.log("CSV item clicked:", item);
    setSelectedCsvItem(item); // Set the selected item to highlight
    onCsvSelect(item);
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
          {/* Scrollable Box for CSV Entries */}
          <div className="scrollable-box">
            <h3>CSV Entries:</h3>
            <div className="csv-list">
              {scrollBoxData.length > 0 ? (
                scrollBoxData.map((name, index) => (
                  <div
                    key={index}
                    className={`csv-item ${selectedCsvItem === name ? 'selected' : ''}`}
                    onClick={() => handleCsvItemClick(name)} // Handle click event
                  >
                    {name}
                  </div>
                ))
              ) : (
                <p>No data available</p>
              )}
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

      {activeTab === 'Settings' && <div className="settings-sidebar"></div>}

      <div className="logo-container">
        <img alt="hsi logo" className="logo" src={HSI_logo} />
        <img alt="fgcu logo" className="logo" src={FGCU_logo} />
      </div>
    </div>
  );
};

export default Sidebar;
