import { X, AlarmClock, Pill } from 'lucide-react';
import { useMedicationReminderContext } from '@/components/medication/MedicationReminderContext';

const categoryConfig: Record<string, { color: string; bg: string }> = {
  dysmenorrhea: { color: 'text-rose-500', bg: 'from-rose-50 to-pink-50' },
  pregnancy: { color: 'text-sky-500', bg: 'from-sky-50 to-blue-50' },
  ovulation: { color: 'text-amber-500', bg: 'from-amber-50 to-orange-50' },
};

export default function GlobalMedicationPopup() {
  const {
    activePopup,
    dismissPopup,
    openRecordDialogFromPopup,
    recordDialog,
    closeRecordDialog,
    setSideEffects,
    setNotes,
    handleTakeMedicine,
    handleSkipMedicine,
  } = useMedicationReminderContext();

  return (
    <>
      {activePopup && (
        <div className="fixed top-6 right-6 z-[60] animate-bounce">
          <div
            className={`card p-5 w-80 shadow-2xl border-2 border-violet-200 bg-gradient-to-br ${
              categoryConfig[activePopup.reminder.category]?.bg || 'from-violet-50 to-purple-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <AlarmClock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-800">服药提醒</h4>
                  <button
                    onClick={dismissPopup}
                    className="w-6 h-6 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-lg font-bold text-gray-900 mt-1">{activePopup.reminder.name}</p>
                <p className="text-sm text-gray-500">
                  {activePopup.reminder.dosage} · {activePopup.time}
                </p>
                {activePopup.reminder.notes && (
                  <p className="text-xs text-gray-400 mt-1">{activePopup.reminder.notes}</p>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={openRecordDialogFromPopup}
                    className="flex-1 bg-gradient-to-r from-emerald-400 to-teal-500 text-white py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    立即服药
                  </button>
                  <button
                    onClick={dismissPopup}
                    className="flex-1 py-2 rounded-full text-sm font-medium bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 transition-all"
                  >
                    稍后
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {recordDialog.open && recordDialog.reminder && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-violet-500" />
                <h2 className="text-lg font-bold text-gray-800">记录服药</h2>
              </div>
              <button
                onClick={closeRecordDialog}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-violet-50 rounded-xl">
              <p className="font-medium text-gray-800">{recordDialog.reminder.name}</p>
              <p className="text-xs text-gray-500">
                {recordDialog.reminder.dosage} · {recordDialog.time}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">不良反应 (可选)</label>
                <input
                  type="text"
                  value={recordDialog.sideEffects}
                  onChange={(e) => setSideEffects(e.target.value)}
                  placeholder="如: 胃部不适"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">备注 (可选)</label>
                <input
                  type="text"
                  value={recordDialog.notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="其他备注"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSkipMedicine}
                  className="flex-1 py-2.5 rounded-full font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                >
                  跳过
                </button>
                <button
                  onClick={handleTakeMedicine}
                  className="flex-1 bg-gradient-to-r from-emerald-400 to-teal-500 text-white py-2.5 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  确认服药
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
