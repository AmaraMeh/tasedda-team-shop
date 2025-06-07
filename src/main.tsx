
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import AOS from 'aos'

// Initialize AOS
AOS.init({
  duration: 800,
  once: true,
  offset: 100
});

createRoot(document.getElementById("root")!).render(<App />);
