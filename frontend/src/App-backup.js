import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>ARMS Platform - Working!</h1>
      <p>If you can see this, React is working.</p>
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => alert('Button works!')}>
          Test Button
        </button>
      </div>
    </div>
  );
}

export default App;
