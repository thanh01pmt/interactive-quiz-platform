import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Adjusted path
// import '../../src/tailwind-base.css'; // If you have global styles for the example app itself, or if library injects them.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);