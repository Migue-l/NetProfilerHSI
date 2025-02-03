import React from 'react';
import HSI_logo from '../assets/photos/HSI_logo.png';
import FGCU_logo from '../assets/photos/FGCU_logo.png';
import PlusAdd from '../assets/icons/PlusAdd.png';
import DeckOfCards from '../assets/icons/DeckofCards.png';

const Sidebar = ({ activeTab }) => {
  return (
    <div className="sidebar">
        {activeTab === 'My Cards' && (
          <div>
            <input type="text" className="search-bar" placeholder="Search cards" />
            <div className="card-button-container">
              <button className="new-card-button">
                <img alt="add image" className="plus_sign" src={PlusAdd} />
                New Card
              </button>
              <button className="new-deck-button">
                <img alt="deck of cards" className="deck_of_cards" src={DeckOfCards} />
                New Deck
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'Editor' && (
          <div className="editor-sidebar">editor sidebar stuff</div>
        )}

      <div className="logo-container">
        <img alt="hsi logo" className="logo" src={HSI_logo} />
        <img alt="fgcu logo" className="logo" src={FGCU_logo} />
      </div>
      
    </div>
  );
};

export default Sidebar;
