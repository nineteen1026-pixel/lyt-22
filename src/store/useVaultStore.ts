import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { VaultEntry } from '@/types';
import { encrypt, decrypt, hashPin, verifyPin } from '@/lib/crypto';

const VAULT_STORAGE_KEY = 'vault-encrypted-data';
const PIN_STORAGE_KEY = 'vault-pin-hash';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface VaultStore {
  entries: VaultEntry[];
  pinHash: string | null;
  isUnlocked: boolean;
  currentPin: string | null;
  isInitialized: boolean;

  setupPin: (pin: string) => Promise<void>;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  addEntry: (entry: Omit<VaultEntry, 'id' | 'createdAt'>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateEntry: (id: string, data: Partial<VaultEntry>) => Promise<void>;
  hasPin: () => boolean;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
}

export const useVaultStore = create<VaultStore>()(
  persist(
    (set, get) => ({
      entries: [],
      pinHash: null,
      isUnlocked: false,
      currentPin: null,
      isInitialized: false,

      hasPin: () => !!get().pinHash,

      setupPin: async (pin: string) => {
        const hash = await hashPin(pin);
        set({ pinHash: hash, isUnlocked: true, currentPin: pin, isInitialized: true });
      },

      unlock: async (pin: string): Promise<boolean> => {
        const { pinHash } = get();
        if (!pinHash) return false;
        const valid = await verifyPin(pin, pinHash);
        if (!valid) return false;

        try {
          const encrypted = localStorage.getItem(VAULT_STORAGE_KEY);
          if (encrypted) {
            const json = await decrypt(encrypted, pin);
            const entries: VaultEntry[] = JSON.parse(json);
            set({ entries, isUnlocked: true, currentPin: pin });
          } else {
            set({ isUnlocked: true, currentPin: pin });
          }
          return true;
        } catch {
          return false;
        }
      },

      lock: () => {
        set({ entries: [], isUnlocked: false, currentPin: null });
      },

      addEntry: async (entry) => {
        const { currentPin, entries } = get();
        if (!currentPin) return;
        const newEntry: VaultEntry = {
          ...entry,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        const updated = [newEntry, ...entries];
        set({ entries: updated });
        await persistEncrypted(updated, currentPin);
      },

      deleteEntry: async (id) => {
        const { currentPin, entries } = get();
        if (!currentPin) return;
        const updated = entries.filter((e) => e.id !== id);
        set({ entries: updated });
        await persistEncrypted(updated, currentPin);
      },

      updateEntry: async (id, data) => {
        const { currentPin, entries } = get();
        if (!currentPin) return;
        const updated = entries.map((e) => (e.id === id ? { ...e, ...data } : e));
        set({ entries: updated });
        await persistEncrypted(updated, currentPin);
      },

      changePin: async (oldPin: string, newPin: string): Promise<boolean> => {
        const { pinHash, entries } = get();
        if (!pinHash) return false;
        const valid = await verifyPin(oldPin, pinHash);
        if (!valid) return false;
        const newHash = await hashPin(newPin);
        set({ pinHash: newHash, currentPin: newPin });
        await persistEncrypted(entries, newPin);
        return true;
      },
    }),
    {
      name: PIN_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pinHash: state.pinHash,
        isInitialized: state.isInitialized,
      }),
    }
  )
);

async function persistEncrypted(entries: VaultEntry[], pin: string): Promise<void> {
  const json = JSON.stringify(entries);
  const encrypted = await encrypt(json, pin);
  localStorage.setItem(VAULT_STORAGE_KEY, encrypted);
}
