import React from 'react';
import { useStore } from '../store/useStore';
import type { Card } from '../store/useStore';
import { Edit2, Trash2 } from 'lucide-react';

interface CardManagerProps {
  onEditCard: (card: Card) => void;
}

export const CardManager: React.FC<CardManagerProps> = ({ onEditCard }) => {
  const { cards, categories, deleteCard } = useStore();

  const getCardTitle = (card: Card) => {
    const texts = card.faces
      .map(f => f.text?.trim())
      .filter(Boolean); // remove empty/undefined texts
      
    if (texts.length > 0) {
      return texts.join('/');
    }
    
    // Fallbacks if no text exists on any face
    if (card.faces.some(f => f.imageUrl)) return 'Card with Image';
    if (card.faces.some(f => f.audioUrl)) return 'Card with Audio';
    return 'Empty Card';
  };

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || 'Unknown Category';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pr-2">
        {cards.map((card) => (
          <div key={card.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-800 dark:text-slate-100">
                {getCardTitle(card)}
              </span>
              <span className="text-sm text-slate-500 font-medium">
                {getCategoryName(card.categoryId)} • {card.faces.length} faces
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => onEditCard(card)}
                className="p-3 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl active:scale-95 transition-transform"
                aria-label="Edit card"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Delete this card?')) {
                    deleteCard(card.id);
                  }
                }}
                className="p-3 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl active:scale-95 transition-transform"
                aria-label="Delete card"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {cards.length === 0 && (
          <div className="text-center text-slate-400 p-4 font-medium mt-4">
            No cards created yet.
          </div>
        )}
      </div>
    </div>
  );
};
