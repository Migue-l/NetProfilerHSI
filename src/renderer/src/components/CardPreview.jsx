import React from "react";
import HSI_logo from "../assets/photos/HSI_logo.png";

const CardPreview = ({ card }) => {
  return (
    <div className="paper-container">
      <header className="prev-header">
        <div className="document-title">
          <h1>UNCLASSIFIED / LAW ENFORCEMENT / SENSITIVE RESTRICTED</h1>
          <p>TEST should display card name: {card.name}</p>
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

      <div className="prev-content">
        <div className="category-container">
          <h3>Personal</h3>
          <div className="subcategory">
            <label>Name:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Moniker:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>DOB:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>COB:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>SSN:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Race:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Gender:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Height:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Weight:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Hair color:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Eye color:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Last Known Residence:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Employment:</label>
            <input type="text" />
          </div>
        </div>

        <div className="category-container">
          <h3>Contact</h3>
          <div className="subcategory">
            <label>Phone Number:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Email Address:</label>
            <input type="text" />
          </div>
        </div>

        <div className="category-container">
          <h3>Criminal</h3>
          <div className="subcategory">
            <label>Suspected Role:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>FBI Number:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Active Warrants:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Criminal History:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>SAR Activity:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Date SAR Checked:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Case Number:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>ROA Number:</label>
            <input type="text" />
          </div>
        </div>

        <div className="category-container">
          <h3>Immigration</h3>
          <div className="subcategory">
            <label>Passport COC:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Immigration Status:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>SID Number:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Travel:</label>
            <input type="text" />
          </div>
        </div>

        <div className="category-container">
          <h3>Affiliation</h3>
          <div className="subcategory">
            <label>Social Media:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Associated Business:</label>
            <input type="text" />
          </div>
        </div>

        <div className="category-container">
          <h3>Vehicle</h3>
          <div className="subcategory">
            <label>Make:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Model:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Vehicle Tag Number:</label>
            <input type="text" />
          </div>
          <div className="subcategory">
            <label>Color:</label>
            <input type="text" />
          </div>
        </div>
      </div>

      <footer className="prev-footer">
        <div className="footer-title">
          <h2>INVESTIGATION CONTINUES</h2>
          <h1>RESTRICTED</h1>
          <h1>UNCLASSIFIED / LAW ENFORCEMENT / SENSITIVE</h1>
        </div>

        <div className="footer-info">
          <div className="footer-item">
            <label>HSI Office:</label>
            <input type="text" className="footer-field" />
          </div>
          <div className="footer-item">
            <label>Analyst:</label>
            <input type="text" className="footer-field" />
          </div>
          <div className="footer-item">
            <label>Date of Information:</label>
            <input type="text" className="footer-field" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CardPreview;
