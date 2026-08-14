import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Card } from '../store/useStore';
import { CategoryManager } from '../components/CategoryManager';
import { CardCreator } from '../components/CardCreator';
import { CardManager } from '../components/CardManager';

export const CarerPortal = () => {
  const navigate = useNavigate();
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full h-full overflow-hidden">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <h2 className="text-3xl font-bold">Carer Portal</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        >
          Exit
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
        {/* Left Column: Managers */}
        <div className="flex flex-col gap-8 overflow-hidden">
          {/* Category Manager */}
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col h-1/2 overflow-hidden">
            <h3 className="text-2xl font-bold mb-4 text-primary-600 dark:text-primary-400 shrink-0">Categories</h3>
            <div className="flex-1 overflow-hidden">
              <CategoryManager />
            </div>
          </div>

          {/* Card Manager */}
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col h-1/2 overflow-hidden">
            <h3 className="text-2xl font-bold mb-4 text-primary-600 dark:text-primary-400 shrink-0">Existing Cards</h3>
            <div className="flex-1 overflow-hidden">
              <CardManager onEditCard={setEditingCard} />
            </div>
          </div>
        </div>
        
        {/* Right Column: Card Creator */}
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden">
          <h3 className="text-2xl font-bold mb-4 text-primary-600 dark:text-primary-400 shrink-0">
            {editingCard ? 'Edit Card' : 'Card Builder'}
          </h3>
          <div className="flex-1 overflow-hidden">
            <CardCreator 
              editCard={editingCard} 
              onCancelEdit={() => setEditingCard(null)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
