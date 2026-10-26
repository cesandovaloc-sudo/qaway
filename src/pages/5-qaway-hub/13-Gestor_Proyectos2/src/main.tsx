import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import ModuleShell from './ModuleShell';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter><ModuleShell /></BrowserRouter></React.StrictMode>,
);
