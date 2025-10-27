import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    React.createElement(React.StrictMode, null,
      React.createElement(App)
    )
  );
  console.log('React app mounted successfully');
} catch (error) {
  console.error('Error mounting React app:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; color: red;">
      <h1>Error mounting React app</h1>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `;
}