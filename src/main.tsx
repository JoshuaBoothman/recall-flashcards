import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Add or remove dark mode class based on store on load
const storageStr = localStorage.getItem('rehab-flashcards-storage');
if (storageStr) {
  try {
    const data = JSON.parse(storageStr);
    if (data.state?.isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    console.error('Error parsing dark mode state on load', e);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
