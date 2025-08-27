import { createRoot } from 'react-dom/client';

import SchoolController from './App';

import './index.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  // <React.StrictMode>
  <SchoolController />,
  // </React.StrictMode>
);
