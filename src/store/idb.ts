import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

interface AppDB extends DBSchema {
  media: {
    key: string; // The URL/ID generated for the media
    value: Blob;
  };
}

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>('rehab-media-db', 1, {
      upgrade(db) {
        db.createObjectStore('media');
      },
    });
  }
  return dbPromise;
};

export const saveMedia = async (id: string, blob: Blob): Promise<void> => {
  const db = await getDB();
  await db.put('media', blob, id);
};

export const getMedia = async (id: string): Promise<Blob | undefined> => {
  const db = await getDB();
  return await db.get('media', id);
};

export const deleteMedia = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('media', id);
};

// Utility to create a transient ObjectURL from indexedDB
export const getMediaUrl = async (id: string): Promise<string | null> => {
  const blob = await getMedia(id);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return null;
};
