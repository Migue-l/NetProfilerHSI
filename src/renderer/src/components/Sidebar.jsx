import React, { useState, useEffect } from 'react';
import HSI_logo from '../assets/HSI_logo.png';
import FGCU_logo from '../assets/FGCU_logo.jpg';

const Sidebar = ({ activeTab, newCardData, setNewCardData, selectedDirectory, availableDecks }) => {
  const [cardName, setCardName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Ensure the selected location resets when directory changes
  useEffect(() => {
    setSelectedLocation('');
  }, [selectedDirectory]);


  const fetchNewCardData = async () => {
    const uniqueCardName = `Net-Card-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}`;

    try {
      const response = await fetch('http://127.0.0.1:5000/api/new-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardName: uniqueCardName, // Unique Name
          location: selectedLocation || "", // Allow empty location (root directory)
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create card: ${errorText}`);
      }

      const data = await response.json();
      console.log('New card created:', data);

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deckName: uniqueDeckName, // Unique Name
          location: selectedLocation || "", // Allow empty location (root directory)
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create deck: ${errorText}`);
      }

      const data = await response.json();
      console.log('New deck created:', data);

      alert(`Deck Created: ${data.deckName}\nSaved at: ${data.filePath}`);

      setNewCardData(data.message);
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
          <select
            className="location-dropdown"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">Select a location</option>
            {availableDecks.map((deck, index) => (
              <option key={index} value={deck}>
                {deck}
              </option>
            ))}
          </select>
          <div className="button-container">
            <button className="new-card-button" onClick={fetchNewCardData}>Add Card</button>
            <button className="new-deck-button" onClick={fetchNewDeckData}>Add Deck</button>
          </div>
          <div className="logo-container">
            <img alt="hsi logo" className="logo" src={HSI_logo} />
            <img alt="fgcu logo" className="logo" src={FGCU_logo} />
          </div>
        </div>
      )}
      {activeTab === 'Editor' && <div className="editor-sidebar">Editor sidebar stuff here</div>}
    </div>
  );
};

export default Sidebar;
