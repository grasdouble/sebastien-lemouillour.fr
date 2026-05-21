import React from 'react';

import { Box } from '@grasdouble/lufa_design-system';

import './i18n';

import styles from './App.module.css';
import { NavBar } from './components';

function App() {
  return (
    <Box id="lufa-header-bar" className={styles['lufa-header-bar']}>
      <NavBar />
    </Box>
  );
}

export default App;
