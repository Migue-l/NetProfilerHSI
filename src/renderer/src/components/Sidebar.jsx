import React, {
    useState,
    useEffect,
    useRef,
    forwardRef,
    useImperativeHandle
  } from 'react';
  import HSI_logo from '../assets/photos/HSI_logo.png';
  import FGCU_logo from '../assets/photos/FGCU_logo.png';
  import PlusAdd from '../assets/icons/PlusAdd.png';
  import DeckOfCards from '../assets/icons/DeckofCards.png';
  import CSVicon from '../assets/icons/CSVicon.png';
  import PDFicon from '../assets/icons/PDFicon.png';
  
  const TitleInput = React.memo(
    forwardRef((props, ref) => {
      const [localTitle, setLocalTitle] = useState('');
      const [forceKey, setForceKey] = useState(Date.now());
      const inputRef = useRef(null);
  
      useImperativeHandle(ref, () => ({
        getTitle: () => localTitle,
        clear: () => {
          setLocalTitle('');
          setForceKey(Date.now());
        },
        focus: () => inputRef.current?.focus()
      }));
  
      useEffect(() => {
        inputRef.current?.focus();
      }, []);
  
      return (
        <input
          key={forceKey}
          ref={inputRef}
          type="text"
          className="card-title-input"
          placeholder="Enter Card Title"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          autoFocus
        />
      );
    })
  );
  
  const Sidebar = ({
    activeTab,
    newCardData,
    setNewCardData,
    selectedDirectory,
    availableDecks,
    onRefresh,
    onCsvSelect
  }) => {
    const [cardName, setCardName] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [scrollBoxData, setScrollBoxData] = useState([]);
    const [selectedCsvItem, setSelectedCsvItem] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const titleInputRef = useRef(null);
  
    useEffect(() => {
      setSelectedLocation('');
    }, [selectedDirectory]);
  
    const fetchNewCardData = async () => {
      const cardTitle = titleInputRef.current?.getTitle().trim();
  
      if (!cardTitle) {
        alert('Card title is required.');
        return;
      }
  
      const uniqueCardName = `Net-Card-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, '-')}`;
  
      try {
        const response = await fetch('http://127.0.0.1:5000/api/new-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardName: uniqueCardName,
            title: cardTitle,
            location: selectedLocation || '',
            createdAt: new Date().toISOString()
          })
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create card: ${errorText}`);
        }
  
        const data = await response.json();
        alert(
          `Card Created: ${data.cardName}\nTitle: ${cardTitle}\nSaved at: ${data.filePath}`
        );
  
        setNewCardData(data.message);
        titleInputRef.current?.clear();
        titleInputRef.current?.focus();
  
        setTimeout(() => {
          onRefresh();
        }, 100);
      } catch (error) {
        console.error('Error creating new card:', error);
        alert('Failed to create new card.');
      }
    };
  
    const fetchNewDeckData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/new-deck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deckName: `New-Deck-${new Date()
              .toISOString()
              .slice(0, 19)
              .replace(/[:T]/g, '-')}`,
            location: selectedLocation || ''
          })
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create deck: ${errorText}`);
        }
  
        const data = await response.json();
        alert(`Deck Created: ${data.deckName}\nSaved at: ${data.filePath}`);
        onRefresh();
      } catch (error) {
        console.error('Error creating new deck:', error);
        alert('Failed to create new deck.');
      }
    };
  
    const handleImportClick = () => {
      if (fileInputRef.current) fileInputRef.current.click();
    };
  
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) {
        alert('Please select a file first!');
        return;
      }
  
      setSelectedFile(file);
  
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const response = await fetch('http://127.0.0.1:5000/api/upload-csv', {
          method: 'POST',
          body: formData
        });
  
        const result = await response.json();
        if (response.ok) {
          alert('File uploaded successfully!');
          await fetchCsvData();
        } else {
          console.error('Error response from backend:', result);
          alert(result.error);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    };
  
    const fetchCsvData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/get-csv-data');
        const result = await response.json();
        if (response.ok) {
          setScrollBoxData(result.names || []);
        } else {
          console.error('Error fetching CSV data:', result.error);
        }
      } catch (error) {
        console.error('Error fetching CSV data:', error);
      }
    };
  
    useEffect(() => {
      fetchCsvData();
    }, []);
  
    const handleCsvItemClick = async (item) => {
      setSelectedCsvItem(item);
      await fetchCsvData();
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
            <TitleInput ref={titleInputRef} />
            <select
              className="location-dropdown"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">Select Card Location</option>
              {availableDecks.map((deck, index) => (
                <option key={index} value={deck}>
                  {deck}
                </option>
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
            <div className="scrollable-box">
              <h3>CSV Entries:</h3>
              <div className="csv-list">
                {scrollBoxData.map((name, index) => (
                  <div
                    key={index}
                    className={`csv-item ${selectedCsvItem === name ? 'selected' : ''}`}
                    onClick={() => handleCsvItemClick(name)}
                  >
                    {name}
                  </div>
                ))}
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