import React from "react";
import HSI_logo from "../assets/photos/HSI_logo.png";

/* test component */
const CardPreview = ({card}) => {
  return (
    <div className="paper-container">
      <header className="prev-header">
        <div className="document-title">
          <h1>UNCLASSIFIED / LAW ENFORCEMENT / SENSITIVE RESTRICTED</h1>
          <text>TEST should display card name: {card.name}</text>
        </div>

        <div className="prev-logo-container">
          <img src={HSI_logo} alt="HSI Logo" className="prev-logo" />
        </div>

        <div className="title-container">
          <label>Title:</label>
          <input type="text" className="title-field" />
        </div>

        <div className="case-info-container">
          <div className="case-item">
            <label>Case Number:</label>
            <input type="text" className="case-field" />
          </div>
          <div className="case-item">
            <label>ROA Number:</label>
            <input type="text" className="case-field" />
          </div>
        </div>
      </header>
      <div className="red-bar"></div>

      <main className="content"></main>
    </div>
  );
};

export default CardPreview;
