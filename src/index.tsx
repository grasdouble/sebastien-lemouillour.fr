import React from 'react';
import { createRoot } from 'react-dom/client';

import 'index.css';
import App from 'App';
import reportWebVitals from 'reportWebVitals';

import { BrowserRouter as Router } from 'react-router-dom';
import config from 'config.json';

import GA4React from 'ga-4-react';
const ga4react = new GA4React(config.googleAnalytics);

(async _ => {
  try {
    await ga4react.initialize();
  } catch (e) {
    console.error('Addblock is activated');
  }

  const container = document.getElementById('root');
  const root = createRoot(container!); // createRoot(container!) if you use TypeScript
  root.render(
    <React.StrictMode>
      <Router>
        <App />
      </Router>
    </React.StrictMode>,
  );
})();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
