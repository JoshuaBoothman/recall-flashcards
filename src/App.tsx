import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Lock, Moon, Sun, Library } from 'lucide-react';
import { useStore } from './store/useStore';
import { initAudioContext } from './utils/audio';

import { PatientMode } from './pages/PatientMode';
import { CarerPortal } from './pages/CarerPortal';

const TopBar = () => {
  const { isDarkMode, toggleDarkMode } = useStore();
  const navigate = useNavigate();

  const handleToggleDark = () => {
    toggleDarkMode();
  };
  
  // Update document class when dark mode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleUnlock = () => {
    // Attempt audio context unlock on interaction
    initAudioContext();
    navigate('/carer');
  };

  return (
    <>
      <header className="flex items-center justify-between p-4 shrink-0 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 shrink-0">
          <Library className="w-8 h-8 text-primary-500" />
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-primary-500 to-primary-700 bg-clip-text text-transparent hidden sm:block">
            Recall
          </h1>
        </div>
        
        <div id="header-controls" className="flex-1 flex items-center justify-center gap-2 sm:gap-4 px-2 sm:px-4"></div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button 
            onClick={handleToggleDark}
            className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors active:scale-95"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-slate-700" />}
          </button>
          
          <button 
            onClick={handleUnlock}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-semibold active:scale-95"
          >
            <Lock className="w-5 h-5" />
            <span className="hidden sm:inline">Carer</span>
          </button>
        </div>
      </header>
    </>
  );
};

function App() {
  const { isDarkMode } = useStore();
  
  // Ensure Audio Context is at least created if suspended on first click anywhere
  useEffect(() => {
    const unlockAudio = () => initAudioContext();
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
    
    // Also explicitly update the body background as a fallback for older WebKit
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
    }

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, [isDarkMode]);

  return (
    <Router>
      {/* Explicit parent div with 'dark' class guarantees Tailwind variants trigger on all children */}
      <div 
        className={isDarkMode ? 'dark' : ''}
        style={{ 
          backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
          color: isDarkMode ? '#f8fafc' : '#0f172a',
          minHeight: '100vh',
          width: '100%'
        }}
      >
        <div className="flex flex-col h-screen w-full overflow-hidden transition-colors duration-300">
          <TopBar />
          <main className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
            <Routes>
              <Route path="/" element={<PatientMode />} />
              <Route path="/carer" element={<CarerPortal />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
