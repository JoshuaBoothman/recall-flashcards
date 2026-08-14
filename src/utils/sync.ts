import { getMedia, saveMedia } from '../store/idb';
import { useStore } from '../store/useStore';

// Convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Convert Base64 back to Blob
const base64ToBlob = async (base64: string): Promise<Blob> => {
  const res = await fetch(base64);
  return await res.blob();
};

export const exportData = async () => {
  const state = useStore.getState();
  const dataToExport: any = {
    version: 1,
    categories: state.categories,
    cards: state.cards,
    media: {}
  };

  // Collect all media IDs used by cards
  const mediaIds = new Set<string>();
  state.cards.forEach(card => {
    if (card.globalAudioUrl) mediaIds.add(card.globalAudioUrl);
    card.faces.forEach(face => {
      if (face.imageUrl) mediaIds.add(face.imageUrl);
      if (face.audioUrl) mediaIds.add(face.audioUrl);
    });
  });

  // Fetch all media blobs and convert them
  for (const id of mediaIds) {
    const blob = await getMedia(id);
    if (blob) {
      dataToExport.media[id] = await blobToBase64(blob);
    }
  }

  // Generate file download
  const jsonString = JSON.stringify(dataToExport);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `recall-backup-${new Date().toISOString().split('T')[0]}.recall`;
  a.click();
  
  URL.revokeObjectURL(url);
};

export const importData = async (file: File) => {
  const text = await file.text();
  const data = JSON.parse(text);

  if (!data.categories || !data.cards || !data.media) {
    throw new Error('Invalid backup file format');
  }

  // Restore media to IndexedDB
  for (const [id, base64] of Object.entries(data.media)) {
    const blob = await base64ToBlob(base64 as string);
    await saveMedia(id, blob);
  }

  // Fully replace Zustand store with imported data
  useStore.setState({
    categories: data.categories,
    cards: data.cards
  });
};
