import React, { useEffect, useRef, useState } from 'react';
import TabHeader from './components/TabHeader.jsx';
import Sidebar from './components/Sidebar.jsx';
import MainContent from './components/MainContent.jsx';
import useServerResponse from '../../hooks/useServerResponse';
import PromptModal from './components/PromptModal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactDOM from 'react-dom/client';
import CardPreview from './components/CardPreview.jsx';
import {renderToString} from 'react-dom/server';

function App() {
  const [activeTab, setActiveTab] = useState("My Cards");
  const [newCardData, setNewCardData] = useServerResponse("No cards created.");
  const [selectedDirectory, setSelectedDirectory] = useState("");
  const [decks, setDecks] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [openCards, setOpenCards] = useState([]);
  const [activeCardIndex, setActiveCardIndex] = useState(null);

  // 🧠 Ref to track which card should be opened after state updates
  const openCardRef = useRef(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [currentCsvItem, setCurrentCsvItem] = useState(null);

  const handleExportPDF = async () => {
    if (activeCardIndex === null || !openCards[activeCardIndex]) return;
    const card = openCards[activeCardIndex];
  
    // 1. Render the CardPreview to an HTML string
    const html = renderToString(<CardPreview card={card} />);
  
    // 2. Create an iframe sandbox to render styles correctly
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.width = '1200px';
    iframe.style.height = '1600px';
    document.body.appendChild(iframe);
  
    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <link rel="stylesheet" type="text/css" href="/src/assets/css/cardpreview.css" />
        </head>
        <body>
          <div id="pdf-root">${html}</div>
        </body>
      </html>
    `);
    iframeDoc.close();
  
    // 3. Wait for iframe to fully load styles and layout
    iframe.onload = async () => {
      const previewElement = iframe.contentDocument.getElementById('pdf-root');
    
      // 1. Render to canvas at native dimensions
      const canvas = await html2canvas(previewElement, {
        scale: 2, // High-res render
        useCORS: true
      });
    
      // 2. PDF dimensions: 8.5in x 11in = 612pt x 792pt
      const pdfWidth = 612;
      const pdfHeight = 792;
    
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt', // Points (1 in = 72 pt)
        format: [pdfWidth, pdfHeight]
      });
    
      // 3. Convert canvas pixels to points
      const pxToPt = 72 / 198;
      const imgWidth = canvas.width * pxToPt;
      const imgHeight = canvas.height * pxToPt;
    
      // 4. Center it (optional, or set to 0,0 for full edge-to-edge)
      const xOffset = (pdfWidth - imgWidth) / 2;
      const yOffset = (pdfHeight - imgHeight) / 2;
    
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
    
      pdf.save(`${card.name || 'Card'}.pdf`);
      document.body.removeChild(iframe);
    };    
  };


  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const categorizeSubcatValues = (flatValues) => {
    const categoryMap = {
      Personal: ["dob", "ssn", "gender", "race", "alias", "cob", "height", "weight", "hair color", "eye color", "last known residence", "employment", "name"],
      Contact: ["phone #", "email address"],
      Immigration: ["immigration status", "passport coc", "sid #", "travel"],
      Vehicle: ["make", "model", "vehicle tag #", "color"],
      Affiliation: ["associated business", "social media"],
      Criminal: ["criminal history", "fbi #", "active warrants", "sar activity", "case #", "roa #", "date sar checked", "suspected role"],
      Other: []  // fallback
    };
  
    const grouped = {};
  
    for (const [key, value] of Object.entries(flatValues)) {
      const normalizedKey = key.toLowerCase();
      let found = false;
      for (const [category, fields] of Object.entries(categoryMap)) {
        if (fields.includes(normalizedKey)) {
          if (!grouped[category]) grouped[category] = {};
          grouped[category][normalizedKey] = value;
          found = true;
          break;
        }
      }
  
      if (!found) {
        if (!grouped.Other) grouped.Other = {};
        grouped.Other[normalizedKey] = value;
      }
    }
  
    return grouped;
  };  


  const handleCsvSelect = (csvItem) => {
    setCurrentCsvItem(csvItem);
    setShowModal(true);
  };

  const handleModalConfirm = async (cardTitle) => {
    try {
      if (!cardTitle) return;

      const cardName = `Net-Card-${Date.now()}`;
      const response = await fetch("http://127.0.0.1:5000/api/new-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardName,
          title: cardTitle,
          location: "",
          createdAt: new Date().toISOString(),
          csvData: currentCsvItem
        })
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();

      const newCard = {
        name: cardName,
        details: {
          type: "CSV Card",
          title: cardTitle,
          csvItem: currentCsvItem,
          filePath: data.filePath
        },
        selectedCategory: null,
        subcatValues: categorizeSubcatValues(data.subcatValues)
      };

      openCardRef.current = newCard; // 🧠 Save the card to be opened
      setOpenCards(prev => [...prev, newCard]); // Trigger re-render
      setShowModal(false);
      //////// alert(`Card "${cardTitle}" created successfully!`);
    } catch (err) {
      //////// alert("Failed to create card: " + err.message);
      console.error(err);
    }
  };

  // 🔁 Watch for new openCards and auto-activate newly created card
  useEffect(() => {
    if (!openCardRef.current || openCards.length === 0) return;

    const index = openCards.findIndex(card => card.name === openCardRef.current.name);
    if (index !== -1) {
      setActiveCardIndex(index);
      setActiveTab("Editor");
      console.log("✅ Auto-opening card:", openCardRef.current.name);
      openCardRef.current = null;
    }
  }, [openCards]);

  return (
    <div className="app-container">
      <TabHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="content-container">
        <Sidebar
          activeTab={activeTab}
          newCardData={newCardData}
          setNewCardData={setNewCardData}
          selectedDirectory={selectedDirectory}
          availableDecks={decks}
          onRefresh={handleRefresh}
          setOpenCards={setOpenCards}
          setActiveCardIndex={setActiveCardIndex}
          setActiveTab={setActiveTab}
          onCsvSelect={handleCsvSelect}
          onExportClick={handleExportPDF}
        />
        <MainContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          newCardData={newCardData}
          setSelectedDirectory={setSelectedDirectory}
          setDecks={setDecks}
          refreshKey={refreshKey}
          openCards={openCards}
          setOpenCards={setOpenCards}
          activeCardIndex={activeCardIndex}
          setActiveCardIndex={setActiveCardIndex}
        />

        {/* Prompt Modal for CSV Card Creation */}
        <PromptModal
          show={showModal}
          title="Create Card from CSV"
          message="Enter a title for this card:"
          defaultValue={currentCsvItem || ""}
          onConfirm={handleModalConfirm}
          onCancel={() => setShowModal(false)}
        />
      </div>
    </div>
  );
}

export default App;