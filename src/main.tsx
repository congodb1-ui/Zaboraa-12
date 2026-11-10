import {createRoot} from 'react-dom/client';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/jetbrains-mono';
import App from './App.tsx';
import './index.css';
import { enforceCanonicalProductionDomain } from './utils/canonicalUrl';

// Enforce canonical domain redirect for legacy production aliases
enforceCanonicalProductionDomain();

createRoot(document.getElementById('root')!).render(<App />);
