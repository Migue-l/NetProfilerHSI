import React from 'react';

const MainContent = ({activeTab, serverResponse}) => {
  return (
    <div className="main-content">
      {activeTab === 'My Cards' && (
        <div>
          <p>{serverResponse}</p> {/* Display server response */}
        </div>
      )}
      {activeTab === 'Editor' && <div>Editor screen</div>}
    </div>
  );
};

export default MainContent;