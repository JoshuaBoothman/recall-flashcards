import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { Card } from '../store/useStore';
import { saveMedia } from '../store/idb';
import { Plus, Trash2, Save, Image as ImageIcon, X } from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';

interface FaceFormState {
  id: string;
  text: string;
  imageFile: File | null;
  audioBlob: Blob | null;
  // keep track of existing media to not overwrite if not changed
  existingImageUrl?: string;
  existingAudioUrl?: string;
}

const createEmptyFace = (): FaceFormState => ({
  id: `face_${Date.now()}_${Math.random()}`,
  text: '',
  imageFile: null,
  audioBlob: null,
});

interface CardCreatorProps {
  editCard?: Card | null;
  onCancelEdit?: () => void;
}

export const CardCreator: React.FC<CardCreatorProps> = ({ editCard, onCancelEdit }) => {
  const { categories, addCard, updateCard } = useStore();
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [faces, setFaces] = useState<FaceFormState[]>([createEmptyFace(), createEmptyFace()]);
  const [globalAudioBlob, setGlobalAudioBlob] = useState<Blob | null>(null);
  const [existingGlobalAudioUrl, setExistingGlobalAudioUrl] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editCard) {
      setSelectedCategory(editCard.categoryId);
      setGlobalAudioBlob(null);
      setExistingGlobalAudioUrl(editCard.globalAudioUrl);
      setFaces(editCard.faces.map(f => ({
        id: `face_${Date.now()}_${Math.random()}`,
        text: f.text || '',
        imageFile: null,
        audioBlob: null,
        existingImageUrl: f.imageUrl,
        existingAudioUrl: f.audioUrl
      })));
    } else {
      // reset
      setGlobalAudioBlob(null);
      setExistingGlobalAudioUrl(undefined);
      setFaces([createEmptyFace(), createEmptyFace()]);
    }
  }, [editCard]);

  const handleAddFace = () => {
    setFaces([...faces, createEmptyFace()]);
  };

  const handleRemoveFace = (id: string) => {
    if (faces.length <= 2) {
      alert("A card must have at least 2 faces.");
      return;
    }
    setFaces(faces.filter(f => f.id !== id));
  };

  const updateFace = (id: string, updates: Partial<FaceFormState>) => {
    setFaces(faces.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleImageChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFace(id, { imageFile: file, existingImageUrl: undefined });
    }
  };

  const handleSave = async () => {
    if (!selectedCategory) {
      alert('Please select or create a category first.');
      return;
    }

    const isValid = faces.every(f => f.text.trim() || f.imageFile || f.existingImageUrl || f.audioBlob || f.existingAudioUrl);
    if (!isValid) {
      alert('Each face must have at least some text, an image, or specific audio.');
      return;
    }

    setIsSaving(true);
    try {
      let finalGlobalAudioUrl = existingGlobalAudioUrl;
      if (globalAudioBlob) {
        const id = `aud_${Date.now()}_${Math.random()}`;
        await saveMedia(id, globalAudioBlob);
        finalGlobalAudioUrl = id;
      }

      const finalFaces = await Promise.all(faces.map(async (face) => {
        let imageUrl = face.existingImageUrl;
        let audioUrl = face.existingAudioUrl;
        
        if (face.imageFile) {
          const imgId = `img_${Date.now()}_${Math.random()}`;
          await saveMedia(imgId, face.imageFile);
          imageUrl = imgId;
        }
        
        if (face.audioBlob) {
          const audId = `aud_${Date.now()}_${Math.random()}`;
          await saveMedia(audId, face.audioBlob);
          audioUrl = audId;
        }

        return {
          text: face.text.trim() || undefined,
          imageUrl,
          audioUrl,
        };
      }));

      if (editCard) {
        updateCard(editCard.id, {
          categoryId: selectedCategory,
          faces: finalFaces,
          globalAudioUrl: finalGlobalAudioUrl,
        });
        if (onCancelEdit) onCancelEdit();
      } else {
        addCard({
          categoryId: selectedCategory,
          faces: finalFaces,
          globalAudioUrl: finalGlobalAudioUrl,
        });
        setFaces([createEmptyFace(), createEmptyFace()]);
        setGlobalAudioBlob(null);
        setExistingGlobalAudioUrl(undefined);
      }
      
      alert(`Card ${editCard ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      console.error(err);
      alert('Error saving card.');
    } finally {
      setIsSaving(false);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500">
        Please create a category first in the Category Manager.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {editCard && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-lg flex items-center justify-between font-bold text-sm shrink-0">
          <span>Editing Card</span>
          <button onClick={onCancelEdit} className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="mb-4 shrink-0 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
          <select 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 bg-primary-50 dark:bg-primary-900/10 rounded-lg p-2.5 border border-primary-100 dark:border-primary-900/50 flex items-center justify-between gap-2">
          <label className="text-xs font-bold text-primary-700 dark:text-primary-400 leading-tight">
            Card Audio<br/><span className="text-[10px] font-medium opacity-80">(Plays on all faces)</span>
          </label>
          <AudioRecorder 
            onAudioReady={(blob) => { setGlobalAudioBlob(blob); setExistingGlobalAudioUrl(undefined); }}
            onClear={() => { setGlobalAudioBlob(null); setExistingGlobalAudioUrl(undefined); }}
            existingAudioUrl={existingGlobalAudioUrl}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pr-1 mb-4">
        {faces.map((face, index) => (
          <div key={face.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700 relative">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Face {index + 1}</h4>
              <button 
                onClick={() => handleRemoveFace(face.id)}
                className="p-1.5 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded active:scale-95"
                title="Remove Face"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col xl:flex-row gap-3">
              <input 
                type="text"
                placeholder="Text label (optional)"
                value={face.text}
                onChange={e => updateFace(face.id, { text: e.target.value })}
                className="flex-1 p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500 text-sm min-w-0"
              />

              <div className="flex gap-2 shrink-0">
                <label className="flex items-center justify-center gap-1.5 p-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-dashed rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-500 font-semibold truncate max-w-[80px]">
                    {face.imageFile ? face.imageFile.name : (face.existingImageUrl ? 'Change' : 'Image')}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageChange(face.id, e)}
                  />
                </label>

                <div className="shrink-0">
                  <AudioRecorder 
                    onAudioReady={(blob) => updateFace(face.id, { audioBlob: blob, existingAudioUrl: undefined })}
                    onClear={() => updateFace(face.id, { audioBlob: null, existingAudioUrl: undefined })}
                    existingAudioUrl={face.existingAudioUrl}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={handleAddFace}
          className="w-full p-3 border-2 border-dashed border-primary-200 text-primary-500 dark:border-primary-800 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/10 active:scale-95 transition-all font-bold flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Face
        </button>
      </div>

      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="w-full p-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 active:scale-95 transition-transform font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      >
        <Save className="w-5 h-5" />
        {isSaving ? 'Saving...' : (editCard ? 'Save Changes' : 'Create Card')}
      </button>
    </div>
  );
};
