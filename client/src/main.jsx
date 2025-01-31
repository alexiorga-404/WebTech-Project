import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './output.css'; // tailwind styling
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <ToastContainer />
  </React.StrictMode>
);