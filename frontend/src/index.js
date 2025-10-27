import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { seedCourses, seedNews, seedMaterials, fixCurrentUser } from './firebase';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (process.env.NODE_ENV !== 'production') {
  window.seedCourses = seedCourses;
  window.seedNews = seedNews;
  window.seedMaterials = seedMaterials;
  window.fixCurrentUser = fixCurrentUser;
}