import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Face {
  text?: string;
  imageUrl?: string; // ID in idb for now
  audioUrl?: string; // ID in idb for now
}

export interface Card {
  id: string;
  categoryId: string;
  faces: Face[];
  globalAudioUrl?: string;
}

interface AppState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  pin: string;
  setPin: (newPin: string) => void;
  
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  
  cards: Card[];
  addCard: (card: Omit<Card, 'id'>) => void;
  updateCard: (id: string, cardUpdate: Partial<Card>) => void;
  deleteCard: (id: string) => void;
}

const defaultCategories: Category[] = [
  { id: 'cat_1', name: 'People', order: 1 },
  { id: 'cat_2', name: 'Animals', order: 2 },
  { id: 'cat_3', name: 'Food', order: 3 },
  { id: 'cat_4', name: 'Objects', order: 4 },
  { id: 'cat_5', name: 'Colours', order: 5 },
  { id: 'cat_6', name: 'Numbers', order: 6 },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      pin: '1234',
      setPin: (newPin) => set({ pin: newPin }),
      
      categories: defaultCategories,
      addCategory: (cat) => set((state) => ({
        categories: [...state.categories, { ...cat, id: `cat_${Date.now()}` }]
      })),
      updateCategory: (id: string, name: string) => set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, name } : c)
      })),
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c.id !== id),
        // optionally, we could delete cards in this category too
      })),
      
      cards: [],
      addCard: (card) => set((state) => ({
        cards: [...state.cards, { ...card, id: `card_${Date.now()}` }]
      })),
      updateCard: (id: string, cardUpdate: Partial<Card>) => set((state) => ({
        cards: state.cards.map(c => 
          c.id === id ? { ...c, ...cardUpdate } : c
        )
      })),
      deleteCard: (id) => set((state) => ({
        cards: state.cards.filter(c => c.id !== id)
      })),
    }),
    {
      name: 'rehab-flashcards-storage',
    }
  )
);
