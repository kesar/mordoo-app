import type { StateStorage } from 'zustand/middleware';
import { storage } from './storage';

export const mmkvStorage: StateStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => { storage.remove(name); },
};
