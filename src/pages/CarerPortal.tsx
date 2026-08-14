import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Card } from '../store/useStore';
import { CategoryManager } from '../components/CategoryManager';
import { CardManager } from '../components/CardManager';
import { CardCreator } from '../components/CardCreator';
import { ArrowLeft, Download, Upload, Loader2 } from 'lucide-react';
import { exportData, importData } from '../utils/sync';

export const CarerPortal = () => {
  const navigate = useNavigate();
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      await exportData();
    } catch (e: any) {
      alert("Export failed: " + e.message);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.confirm("WARNING: Importing data will completely overwrite all current categories and cards. Are you sure you want to proceed?")) {
      setIsImporting(true);
      try {
        await importData(file);
        alert("Data successfully imported!");
      } catch (err) {
        alert("Failed to import data. Please ensure it is a valid .recall file.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } else {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8 min-h-0 overflow-y-auto no-scrollbar">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold">Carer Portal</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-semibold"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Backup</span>
          </button>
          
          <button 
            onClick={handleImportClick}
            disabled={isImporting}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-semibold disabled:opacity-50"
          >
            {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            <span className="hidden sm:inline">Import</span>
          </button>
          <input 
            type="file" 
            accept=".recall,.json" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
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
