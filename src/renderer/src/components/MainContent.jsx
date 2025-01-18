import React from 'react';

const MainContent = ({ activeTab }) => {
  return (
    <div className="main-content">
      {activeTab === 'My Cards' && <div>Cards ajksfjashf</div>}
      {activeTab === 'Editor' && <div>Editor screen</div>}
    </div>
  );
};

export default MainContent;