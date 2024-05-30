import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.js"
import { BrowserRouter as Router } from 'react-router-dom'
import { useEffect } from 'react'

const RefreshOnBack = () => {
  useEffect(() => {
    const handlePopstate = () => {
      window.location.reload();
    };

    window.addEventListener("popstate", handlePopstate);

    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, []);

  return null; 
};


ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <RefreshOnBack />
    <App />
  </Router>,
  document.getElementById("root")
)
