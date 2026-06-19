import { createContext, useContext, ReactNode } from 'react';
import { useMedicationReminder, UseMedicationReminderReturn } from '@/hooks/useMedicationReminder';

const MedicationReminderContext = createContext<UseMedicationReminderReturn | null>(null);

export function MedicationReminderProvider({ children }: { children: ReactNode }) {
  const reminder = useMedicationReminder();
  return (
    <MedicationReminderContext.Provider value={reminder}>
      {children}
    </MedicationReminderContext.Provider>
  );
}

export function useMedicationReminderContext() {
  const ctx = useContext(MedicationReminderContext);
  if (!ctx) {
    throw new Error('useMedicationReminderContext must be used within MedicationReminderProvider');
  }
  return ctx;
}
