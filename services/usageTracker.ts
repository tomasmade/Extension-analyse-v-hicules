// Déclaration pour que TS ne bloque pas si @types/chrome n'est pas installé
declare const chrome: any;

interface DailyUsage {
  date: string; // Format YYYY-MM-DD
  count: number;
}

const STORAGE_KEY = 'dailyUsage';

// Helper pour abstraire le mécanisme de stockage (Chrome Storage ou LocalStorage)
const getStorage = async (): Promise<DailyUsage | null> => {
  // Si on est dans l'extension Chrome (détection via l'objet global chrome)
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || null;
  } else {
    // Mode développement / Web classique
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : null;
  }
};

const setStorage = async (usage: DailyUsage): Promise<void> => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ [STORAGE_KEY]: usage });
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  }
};

export const getRemainingUsage = async (): Promise<number> => {
  const today = new Date().toISOString().split('T')[0];
  const usage = await getStorage();

  if (!usage || usage.date !== today) {
    return 10; // Nouveau jour = 10 crédits
  }
  
  return Math.max(0, 10 - usage.count);
};

export const checkDailyLimit = async (): Promise<boolean> => {
  const remaining = await getRemainingUsage();
  return remaining > 0;
};

export const incrementDailyUsage = async (): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  const usage = await getStorage();

  if (!usage || usage.date !== today) {
    // Nouveau jour : on initialise à 1
    await setStorage({ date: today, count: 1 });
  } else {
    // Jour existant : on incrémente
    await setStorage({ date: today, count: usage.count + 1 });
  }
};