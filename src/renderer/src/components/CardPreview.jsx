import React from "react";
import HSI_logo from "../assets/photos/HSI_logo.png";
import Subject_Placeholder from "../assets/photos/Subject_Placeholder.png"

const CardPreview = ({ card }) => {
  const subcatValues = card.subcatValues || {};

  const getSubcatValue = (category, subcatLabel) => {
    const categoryData = subcatValues[category] || {};
    return categoryData[subcatLabel.toLowerCase()] || "";
  }

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
            <input type="text" className="case-field" value={getSubcatValue("Criminal", "Case #")} readOnly/>
          </div>
          <div className="case-item">
            <label>ROA Number:</label>
            <input type="text" className="case-field"  value={getSubcatValue("Criminal", "ROA #")} readOnly/>
          </div>
        </div>
      </header>

      <div className="red-bar"></div>

      <div className="prev-content">
        <div className="category-container">
          <h3>Personal</h3>
          <div className="subcategory">
            <label>Name:</label>
            <input type="text" value={getSubcatValue("Personal", "Name")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Alias:</label>
            <input type="text" value={getSubcatValue("Personal", "Alias")} readOnly/>
          </div>
          <div className="subcategory">
            <label>DOB:</label>
            <input type="text" value={getSubcatValue("Personal", "DOB")} readOnly/>
          </div>
          <div className="subcategory">
            <label>COB:</label>
            <input type="text" value={getSubcatValue("Personal", "COB")} readOnly/>
          </div>
          <div className="subcategory">
            <label>SSN:</label>
            <input type="text" value={getSubcatValue("Personal", "SSN")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Race:</label>
            <input type="text" value={getSubcatValue("Personal", "Race")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Gender:</label>
            <input type="text" value={getSubcatValue("Personal", "Gender")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Height:</label>
            <input type="text" value={getSubcatValue("Personal", "Height")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Weight:</label>
            <input type="text" value={getSubcatValue("Personal", "Weight")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Hair color:</label>
            <input type="text" value={getSubcatValue("Personal", "Hair Color")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Eye color:</label>
            <input type="text" value={getSubcatValue("Personal", "Eye Color")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Last Known Residence:</label>
            <input type="text" value={getSubcatValue("Personal", "Last Known Residence")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Employment:</label>
            <input type="text" value={getSubcatValue("Personal", "Employment")} readOnly/>
          </div>
        </div>

        <div className="category-container">
          <h3>Contact</h3>
          <div className="subcategory">
            <label>Phone Number:</label>
            <input type="text" value={getSubcatValue("Contact", "Phone #")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Email Address:</label>
            <input type="text" value={getSubcatValue("Contact", "Email Address")} readOnly/>
          </div>
        </div>

        <div className="category-container">
          <h3>Criminal</h3>
          <div className="subcategory">
            <label>Suspected Role:</label>
            <input type="text" value={getSubcatValue("Criminal", "Suspected Role")} readOnly/>
          </div>
          <div className="subcategory">
            <label>FBI Number:</label>
            <input type="text" value={getSubcatValue("Criminal", "FBI #")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Active Warrants:</label>
            <input type="text" value={getSubcatValue("Criminal", "Active Warrants")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Criminal History:</label>
            <input type="text" value={getSubcatValue("Criminal", "Criminal History")} readOnly/>
          </div>
          <div className="subcategory">
            <label>SAR Activity:</label>
            <input type="text" value={getSubcatValue("Criminal", "SAR Activity")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Date SAR Checked:</label>
            <input type="text" value={getSubcatValue("Criminal", "Date SAR Checked")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Case Number:</label>
            <input type="text" value={getSubcatValue("Criminal", "Case #")} readOnly/>
          </div>
          <div className="subcategory">
            <label>ROA Number:</label>
            <input type="text" value={getSubcatValue("Criminal", "ROA #")} readOnly/>
          </div>
        </div>

        <div className="photo-container">
          <h3>Subject Photo</h3>
          <div className="photo-box">
            
            <img src={Subject_Placeholder} alt="subject" />
            
          </div>
        </div>

        <div className="category-container">
          <h3>Immigration</h3>
          <div className="subcategory">
            <label>Passport COC:</label>
            <input type="text" value={getSubcatValue("Immigration", "Passport COC")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Immigration Status:</label>
            <input type="text" value={getSubcatValue("Immigration", "Immigration Status")} readOnly/>
          </div>
          <div className="subcategory">
            <label>SID Number:</label>
            <input type="text" value={getSubcatValue("Immigration", "SID #")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Travel:</label>
            <input type="text" value={getSubcatValue("Immigration", "Travel")} readOnly/>
          </div>
        </div>

        <div className="category-container">
          <h3>Affiliation</h3>
          <div className="subcategory">
            <label>Social Media:</label>
            <input type="text" value={getSubcatValue("Affiliation", "Social Media")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Associated Business:</label>
            <input type="text" value={getSubcatValue("Affiliation", "Associated Business")} readOnly/>
          </div>
        </div>

        <div className="category-container">
          <h3>Vehicle</h3>
          <div className="subcategory">
            <label>Make:</label>
            <input type="text" value={getSubcatValue("Vehicle", "Make")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Model:</label>
            <input type="text" value={getSubcatValue("Vehicle", "Model")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Vehicle Tag Number:</label>
            <input type="text" value={getSubcatValue("Vehicle", "Vehicle Tag #")} readOnly/>
          </div>
          <div className="subcategory">
            <label>Color:</label>
            <input type="text" value={getSubcatValue("Vehicle", "Color")} readOnly/>
          </div>
        </div>
      </div>

      <div className="case-notes-container">
        <h3>Case Notes</h3>
        <textarea
          className="case-notes-textarea"
          placeholder="Additional Notes..."
        />
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
