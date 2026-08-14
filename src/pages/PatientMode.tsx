import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store/useStore';
import type { Card } from '../store/useStore';
import { CardViewer } from '../components/CardViewer';

export const PatientMode = () => {
  const { categories, cards } = useStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalNode(document.getElementById('header-controls'));
  }, []);

  const getRandomCard = (excludeId?: string) => {
    let deck = cards;
    if (selectedCategoryId !== 'all') {
      deck = cards.filter(c => c.categoryId === selectedCategoryId);
    }
    
    if (deck.length === 0) return null;
    
    // Pick a random card
    const randomIndex = Math.floor(Math.random() * deck.length);
    let next = deck[randomIndex];

    // Try not to show the exact same card twice in a row if there are multiple cards
    if (deck.length > 1 && next.id === excludeId) {
      next = deck[(randomIndex + 1) % deck.length];
    }
    return next;
  };

  useEffect(() => {
    setCurrentCard(getRandomCard());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, cards.length]); // Ignore currentCard dependency to prevent infinite loop

  const handleNextCard = () => {
    setCurrentCard(getRandomCard(currentCard?.id));
  };

  const controls = (
    <>
      <select 
        value={selectedCategoryId}
        onChange={(e) => setSelectedCategoryId(e.target.value)}
        className="text-xl font-bold bg-transparent outline-none border-b-2 border-primary-500 pb-1 text-slate-800 dark:text-slate-100 cursor-pointer appearance-none text-center sm:text-left truncate max-w-[150px] sm:max-w-xs"
        style={{ WebkitAppearance: 'none' }} // Ensure native styling doesn't hide text
      >
        <option value="all" className="text-slate-900 dark:text-slate-100 dark:bg-slate-800">All Categories</option>
        {categories.map(c => (
          <option key={c.id} value={c.id} className="text-lg text-slate-900 dark:text-slate-100 dark:bg-slate-800">{c.name}</option>
        ))}
      </select>

      {currentCard && (
        <label className="flex items-center gap-1.5 cursor-pointer select-none bg-slate-100 dark:bg-slate-800/50 py-1.5 px-3 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0">
          <input 
            type="checkbox" 
            checked={isLocked} 
            onChange={(e) => setIsLocked(e.target.checked)} 
            className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500"
          />
          <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">Lock</span>
        </label>
      )}
    </>
  );

  if (categories.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
        <h2 className="text-4xl font-bold mb-4">Welcome</h2>
        <p className="text-xl text-slate-500 max-w-md">
          Please ask your carer to create some categories and cards first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full">
      {portalNode && createPortal(controls, portalNode)}
      <div className="flex-1 overflow-hidden flex flex-col">
        {currentCard ? (
          <CardViewer key={currentCard.id} card={currentCard} onNextCard={handleNextCard} isLocked={isLocked} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-2xl text-slate-400 font-semibold">
              No cards found in this deck.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
