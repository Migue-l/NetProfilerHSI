import React from 'react';
import { useState } from 'react';

const MainContent = ({activeTab}) => {
  const [csvData, setCsvData] = useState('Waiting for csv data...');
  const fetchCsvData = async () => {
    try {
      // Check for server response, assign to local var
      const response = await fetch('http://127.0.0.1:5000/api/csv-test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Checks for HTTP error
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched csv data:', data);

      const csvText = csvToText(data);
      setCsvData(csvText);

    } catch (error) {
      setCsvData('Error fetching CSV data.');
      // Debug code: Err not visible during normal operation
      console.error('Error fetching CSV data.', error);
    }
  };

  // Convert JSON data into a formatted CSV-like text display
  const csvToText = (jsonData) => {
    // Check if input data is in a valid json format
    if (!jsonData || !jsonData.columns || !jsonData.data) return 'Invalid data format';

    // Generate the header row (column names)
    const header = jsonData.columns.join(' | ');

    // Print line to separate headers and rows
    const separator = '-'.repeat(header.length);

    // Convert each row into a formatted string
    const rows = jsonData.data.map(row => row.join(' | ')).join('\n');

    // Combine all parts into the final formatted text
    return `${header}\n${separator}\n${rows}`;
};

  return (
    <div className="main-content">
      {activeTab === 'My Cards'}
      {activeTab === 'Editor' && (
        <div>
          <button onClick={fetchCsvData}>Fetch CSV Data</button>
        {/*Re-prints csvData every time its value updates */}
        <pre>{csvData}</pre>
      </div>
      )}
    </div>
  );
};

export default MainContent;