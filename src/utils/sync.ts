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

// Convert Base64 back to Blob safely for older browsers (no fetch on data URLs)
const base64ToBlob = (base64: string): Blob => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const exportData = async () => {
  const state = useStore.getState();
  const dataToExport: any = {
    version: 1,
    categories: state.categories,
    cards: state.cards,
    media: {}
  };

  const mediaIds = new Set<string>();
  state.cards.forEach(card => {
    if (card.globalAudioUrl) mediaIds.add(card.globalAudioUrl);
    card.faces.forEach(face => {
      if (face.imageUrl) mediaIds.add(face.imageUrl);
      if (face.audioUrl) mediaIds.add(face.audioUrl);
    });
  });

  for (const id of mediaIds) {
    const blob = await getMedia(id);
    if (blob) {
      dataToExport.media[id] = await blobToBase64(blob);
    }
  }

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
  const text = await readFileAsText(file);
  const data = JSON.parse(text);

  if (!data.categories || !data.cards || !data.media) {
    throw new Error('Invalid backup file format');
  }

  for (const [id, base64] of Object.entries(data.media)) {
    const blob = base64ToBlob(base64 as string);
    await saveMedia(id, blob);
  }

  useStore.setState({
    categories: data.categories,
    cards: data.cards
  });
};
