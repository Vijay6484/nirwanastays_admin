import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ReactQuill from 'react-quill';
import App from './App.tsx';
import './index.css';
import 'react-quill/dist/quill.snow.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);