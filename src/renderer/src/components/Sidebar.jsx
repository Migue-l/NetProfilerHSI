import React from 'react';
import HSI_logo from '../assets/HSI_logo.png'
import FGCU_logo from '../assets/FGCU_logo.jpg'

const Sidebar = ({ activeTab, setServerResponse }) => {
  const handleNewCard = async () => {
    try {
      // Check for server response, assign to local var
      const response = await fetch('http://127.0.0.1:5000/api/new-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardName: 'New Card', // Example payload; modify as needed
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('New card created:', data);

      // Update the server response state
      setServerResponse(data.message); // For example, display the "message" field
    } catch (error) {
      // Debug code: Err not visible during normal operation
      console.error('Error creating new card:', error);
      setServerResponse('Error creating new card.'); // Display error message
    }
  };

  return (
    <div className="sidebar">
      {activeTab === 'My Cards' && (
        <div>
          <input type="text" className="search-bar" placeholder="Search cards" />
          <div className="button-container">
            <button className="new-card-button" onClick={handleNewCard}>New Card</button>
            <button className="new-deck-button">New Deck</button>
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