import './globals.css';

import * as React from "react";
import { createRoot } from "react-dom/client";
import App from './App';
import { Toaster } from '@/components/ui/sonner';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
   <App/>
   <Toaster />
  </React.StrictMode>
);