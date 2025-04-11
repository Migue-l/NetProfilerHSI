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
        className="search-bar"
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
  showNotification,
  onCsvSelect,
  onExportClick,
  setActiveTab
}) => {
  const [cardName, setCardName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [scrollBoxData, setScrollBoxData] = useState([]);
  const [selectedCsvItem, setSelectedCsvItem] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const fileInputRef = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => {
    setSelectedLocation('');
  }, [selectedDirectory]);

  const fetchNewCardData = async () => {
    if (batchMode) return;

    const cardTitle = titleInputRef.current?.getTitle().trim();
    if (!cardTitle) {
      showNotification('Error', 'Card title is required');
      return;
    }

    const uniqueCardName = `Net-Card-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}`;
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

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      showNotification('Success', `Card Created: ${data.cardName}\nTitle: ${cardTitle}`);
      setNewCardData(data.message);
      titleInputRef.current?.clear();
      titleInputRef.current?.focus();
      setTimeout(onRefresh, 1000);
    } catch (error) {
      console.error('Error creating new card:', error);
      showNotification('Error', 'Failed to create new card');
    }
  };

  const fetchNewDeckData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/new-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckName: `New-Deck-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}`,
          location: selectedLocation || ''
        })
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      showNotification('Success', `Deck Created: ${data.deckName}`);
      onRefresh();
    } catch (error) {
      console.error('Error creating new deck:', error);
      showNotification('Error', 'Failed to create new deck');
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return showNotification('Wait', 'Please select a file first!');
  
    setSelectedFile(file);
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch('http://127.0.0.1:5000/api/upload-csv', {
        method: 'POST',
        body: formData
      });
  
      const result = await response.json();
      if (!response.ok) {
        console.error('Error uploading file:', result);
        return showNotification('Error', result.error || 'Failed to upload file');
      }
  
      showNotification('Success', 'CSV uploaded successfully');
      await fetchCsvData();
  
      if (batchMode) {
        const batchResp = await fetch('http://127.0.0.1:5000/api/batch-create-cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
  
        const batchResult = await batchResp.json();
        if (!batchResp.ok) {
          return showNotification('Error', batchResult.error || 'Batch creation failed');
        }
  
        showNotification('Success', `Batch card creation complete (${batchResult.created} cards)`);
  
        if (Array.isArray(batchResult.created_titles)) {
          setActiveTab('Editor');
          batchResult.created_titles.forEach((name, i) => {
            setTimeout(() => onCsvSelect(name , {isBatch: true }), i * 300); // ⏳ staggered opening
          });
        }
      }
  
      setTimeout(() => onRefresh(), 300);
  
    } catch (error) {
      console.error('Upload failed:', error);
      showNotification('Error', 'Upload or batch create failed');
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
    onCsvSelect(item);
  };

  const filteredCsvEntries = scrollBoxData.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {!batchMode && <TitleInput ref={titleInputRef} />}
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
            <button className="new-card-button" 
            onClick={fetchNewCardData}
            disabled={batchMode}
            title={batchMode ? "Disabled in batch mode" : "Create a new card"}
            >
              <img alt="add" className="plus_sign" src={PlusAdd} /> New Card
            </button>
            <button className="new-deck-button" onClick={fetchNewDeckData}>
              <img alt="deck" className="deck_of_cards" src={DeckOfCards} /> New Deck
            </button>
          </div>
        </div>
      )}

      {activeTab === 'Editor' && (
        <div className="editor-sidebar">
          <div className="import-export-container">
            <button className="import-export-button" onClick={handleImportClick}>
              <img alt="csv icon" className="csv-icon" src={CSVicon} /> Import File
            </button>
            <button className="import-export-button" onClick={onExportClick}>
              <img alt="pdf icon" className="pdf-icon" src={PDFicon} /> Export File
            </button>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <input
              type="checkbox"
              checked={batchMode}
              onChange={(e) => setBatchMode(e.target.checked)}
            />
            Enable Batch Create
          </label>

          <input
            type="text"
            className="search-bar"
            placeholder="Search CSV Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ margin: '8px 0' }}
          />

          <div className="scrollable-box">
            <h3>CSV Entries:</h3>
            <div className="csv-list">
              {filteredCsvEntries.map((name, index) => (
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