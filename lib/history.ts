import { AnalysisResult } from './analyzeFace';

export interface HistoryItem {
    id: number;
    date: string;
    type: 'front' | 'side';
    image: string; // Base64 string
    result: AnalysisResult;
}

const DB_NAME = 'FaceRatingsDB';
const STORE_NAME = 'scans';
const DB_VERSION = 1;

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB error:", event);
            reject("Error opening database");
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
    });
};

export const saveScan = async (type: 'front' | 'side', image: string, result: AnalysisResult): Promise<number> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const item = {
            date: new Date().toISOString(),
            type,
            image,
            result
        };

        const request = store.add(item);

        request.onsuccess = () => {
            resolve(request.result as number);
        };

        request.onerror = () => {
            reject("Error saving scan");
        };
    });
};

export const getHistory = async (): Promise<HistoryItem[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve((request.result as HistoryItem[]).reverse()); // Newest first
        };

        request.onerror = () => {
            reject("Error fetching history");
        };
    });
};

export const deleteScan = async (id: number): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject("Error deleting scan");
        };
    });
};

export const clearHistory = async (): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject("Error clearing history");
        };
    });
};
