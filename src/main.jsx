import React from 'react';
import ReactDOM from 'react-dom/client';
import Userback from '@userback/widget';
import App from './App';

// Initialize Userback only if URL contains "qa"
const initializeUserback = async () => {
  if (window.location.href.includes('qa')) {
    try {
      await Userback('A-ksUnFdmWEsWU3CvfGKILuh0kK');
    } catch (error) {
      console.error('Failed to initialize Userback:', error);
    }
  }
};

// Initialize Userback before rendering the app
initializeUserback();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
