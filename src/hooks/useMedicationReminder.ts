import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { MedicationReminder } from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

export interface ActiveReminderPopup {
  id: string;
  reminder: MedicationReminder;
  time: string;
}

export interface RecordDialogState {
  open: boolean;
  reminder: MedicationReminder | null;
  time: string;
  sideEffects: string;
  notes: string;
}

export function useMedicationReminder() {
  const { getTodayMedicationSchedule, addMedicationRecord } = useAppStore();

  const [popupQueue, setPopupQueue] = useState<ActiveReminderPopup[]>([]);
  const [recordDialog, setRecordDialog] = useState<RecordDialogState>({
    open: false,
    reminder: null,
    time: '',
    sideEffects: '',
    notes: '',
  });

  const notifiedKeysRef = useRef<Set<string>>(new Set());

  const activePopup = popupQueue[0] || null;

  const dismissPopup = useCallback(() => {
    setPopupQueue((prev) => prev.slice(1));
  }, []);

  const openRecordDialogFromPopup = useCallback(() => {
    if (activePopup) {
      setRecordDialog({
        open: true,
        reminder: activePopup.reminder,
        time: activePopup.time,
        sideEffects: '',
        notes: '',
      });
      dismissPopup();
    }
  }, [activePopup, dismissPopup]);

  const openRecordDialog = useCallback((reminder: MedicationReminder, time: string) => {
    setRecordDialog({
      open: true,
      reminder,
      time,
      sideEffects: '',
      notes: '',
    });
  }, []);

  const closeRecordDialog = useCallback(() => {
    setRecordDialog({
      open: false,
      reminder: null,
      time: '',
      sideEffects: '',
      notes: '',
    });
  }, []);

  const handleTakeMedicine = useCallback(() => {
    if (!recordDialog.reminder) return;
    const today = new Date().toISOString().split('T')[0];
    const existing = useAppStore
      .getState()
      .medicationRecords.find(
        (r) =>
          r.reminderId === recordDialog.reminder!.id &&
          r.date === today &&
          r.time === recordDialog.time
      );
    if (!existing) {
      addMedicationRecord({
        id: generateId(),
        reminderId: recordDialog.reminder.id,
        date: today,
        time: recordDialog.time,
        taken: true,
        skipped: false,
        sideEffects: recordDialog.sideEffects || undefined,
        notes: recordDialog.notes || undefined,
      });
    }
    closeRecordDialog();
  }, [recordDialog, addMedicationRecord, closeRecordDialog]);

  const handleSkipMedicine = useCallback(() => {
    if (!recordDialog.reminder) return;
    const today = new Date().toISOString().split('T')[0];
    const existing = useAppStore
      .getState()
      .medicationRecords.find(
        (r) =>
          r.reminderId === recordDialog.reminder!.id &&
          r.date === today &&
          r.time === recordDialog.time
      );
    if (!existing) {
      addMedicationRecord({
        id: generateId(),
        reminderId: recordDialog.reminder.id,
        date: today,
        time: recordDialog.time,
        taken: false,
        skipped: true,
        notes: recordDialog.notes || '跳过',
      });
    }
    closeRecordDialog();
  }, [recordDialog, addMedicationRecord, closeRecordDialog]);

  const setSideEffects = useCallback((v: string) => {
    setRecordDialog((p) => ({ ...p, sideEffects: v }));
  }, []);

  const setNotes = useCallback((v: string) => {
    setRecordDialog((p) => ({ ...p, notes: v }));
  }, []);

  useEffect(() => {
    const checkDueReminders = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hh}:${mm}`;
      const today = now.toISOString().split('T')[0];
      const schedule = getTodayMedicationSchedule();

      for (const item of schedule) {
        if (item.time !== currentTime) continue;
        if (item.record?.taken || item.record?.skipped) continue;
        const key = `${today}-${item.reminder.id}-${item.time}`;
        if (notifiedKeysRef.current.has(key)) continue;
        notifiedKeysRef.current.add(key);
        setPopupQueue((prev) => [
          ...prev,
          { id: generateId(), reminder: item.reminder, time: item.time },
        ]);
      }
    };

    checkDueReminders();
    const timer = setInterval(checkDueReminders, 30 * 1000);
    return () => clearInterval(timer);
  }, [getTodayMedicationSchedule]);

  return {
    activePopup,
    dismissPopup,
    openRecordDialogFromPopup,
    recordDialog,
    openRecordDialog,
    closeRecordDialog,
    setSideEffects,
    setNotes,
    handleTakeMedicine,
    handleSkipMedicine,
  };
}

export type UseMedicationReminderReturn = ReturnType<typeof useMedicationReminder>;
