import React from 'react';
import HSI_logo from '../assets/HSI_logo.png'
import FGCU_logo from '../assets/FGCU_logo.jpg'

const Sidebar = ({ activeTab }) => {
  return (
    <div className="sidebar">
      {activeTab === 'My Cards' && (
        <div>
          <input type="text" className="search-bar" placeholder="Search cards" />
          <div className="button-container">
            <button className="new-card-button">New Card</button>
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