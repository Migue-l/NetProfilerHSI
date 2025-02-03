import React from 'react';
import HSI_logo from '../assets/HSI_logo.png'
import FGCU_logo from '../assets/FGCU_logo.jpg'

const Sidebar = ({ activeTab, newCardData, setNewCardData}) => {
  const fetchNewCardData = async () => {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/new-card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cardName: `Net-Card-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}`, // Unique Name
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

    } catch (error) {
        console.error('Error creating new card:', error);
        alert('Failed to create new card.');
    }
  };


  return (
    <div className="sidebar">
      {activeTab === 'My Cards' && (
        <div>
          <input type="text" className="search-bar" placeholder="Search cards" />
          <div className="button-container">
            <button className="new-card-button" onClick={fetchNewCardData}>Add Card</button>
            <button className="new-deck-button">Add Deck</button>
          </div>
          <div className="logo-container">
            <img alt="hsi logo" className='logo' src={HSI_logo} />
            <img alt="fgcu logo" className='logo' src={FGCU_logo} />
          </div>
        </div>
      )}
      {activeTab === 'Editor' && (
        <div className="editor-sidebar">editor sidebar stuff here</div>
      )}
    </div>
  );
};

export default Sidebar;