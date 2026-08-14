import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';

export const CategoryManager = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({ name: newCatName.trim(), order: categories.length + 1 });
    setNewCatName('');
  };

  const handleEditSave = (id: string) => {
    if (!editName.trim()) return;
    updateCategory(id, editName.trim());
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input 
          type="text"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          placeholder="New category name..."
          className="flex-1 p-4 rounded-xl bg-slate-100 dark:bg-slate-700/50 border-none outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button 
          type="submit"
          className="p-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 active:scale-95 transition-transform flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pr-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
            {editingId === cat.id ? (
              <div className="flex-1 flex gap-2">
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
                <button onClick={() => handleEditSave(cat.id)} className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg">
                  <Check className="w-5 h-5" />
                </button>
                <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <span className="font-semibold text-lg">{cat.name}</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                    className="p-3 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl active:scale-95 transition-transform"
                    aria-label="Edit category"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => deleteCategory(cat.id)}
                    className="p-3 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl active:scale-95 transition-transform"
                    aria-label="Delete category"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <div className="text-center text-slate-400 p-4">
            No categories yet.
          </div>
        )}
      </div>
    </div>
  );
};
