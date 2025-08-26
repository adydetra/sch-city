import './index.css';

import { createRoot } from 'react-dom/client';

import SchoolController from './App';

const root = createRoot(document.getElementById('root')!);
root.render(
  // <React.StrictMode>
  <SchoolController />
  // </React.StrictMode>
);
