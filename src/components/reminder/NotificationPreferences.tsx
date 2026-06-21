import { useState } from 'react';
import { X, Bell, BellOff, Volume2, VolumeX, Vibrate, Moon, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { categoryMeta } from '@/services/reminderRuleEngine';
import type { ReminderCategory, NotificationCategoryPref } from '@/types';

const allCategories: ReminderCategory[] = ['period', 'ovulation', 'prenatal', 'postpartum', 'medication', 'custom'];

export default function NotificationPreferences({ onClose }: { onClose: () => void }) {
  const { notificationPreferences, setNotificationPreferences } = useAppStore();
  const [expandedCategory, setExpandedCategory] = useState<ReminderCategory | null>(null);

  const prefs = notificationPreferences;

  const updateCategoryPref = (cat: ReminderCategory, update: Partial<NotificationCategoryPref>) => {
    setNotificationPreferences({
      categories: {
        ...prefs.categories,
        [cat]: { ...prefs.categories[cat], ...update },
      },
    });
  };

  const addTimeToCategory = (cat: ReminderCategory) => {
    const current = prefs.categories[cat].times;
    const lastHour = current.length > 0 ? parseInt(current[current.length - 1].split(':')[0]) : 8;
    const newHour = Math.min(lastHour + 4, 22);
    const newTime = `${String(newHour).padStart(2, '0')}:00`;
    if (!current.includes(newTime)) {
      updateCategoryPref(cat, { times: [...current, newTime].sort() });
    }
  };

  const removeTimeFromCategory = (cat: ReminderCategory, time: string) => {
    const current = prefs.categories[cat].times;
    if (current.length > 1) {
      updateCategoryPref(cat, { times: current.filter((t) => t !== time) });
    }
  };

  const updateTimeInCategory = (cat: ReminderCategory, oldTime: string, newTime: string) => {
    const current = prefs.categories[cat].times;
    updateCategoryPref(cat, { times: current.map((t) => (t === oldTime ? newTime : t)).sort() });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card p-0 w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-violet-500" />
            <h2 className="text-lg font-bold text-gray-800">通知偏好设置</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex items-center gap-3">
              {prefs.enabled ? (
                <Bell className="w-6 h-6 text-violet-500" />
              ) : (
                <BellOff className="w-6 h-6 text-gray-400" />
              )}
              <div>
                <p className="font-bold text-gray-800">通知总开关</p>
                <p className="text-xs text-gray-500">{prefs.enabled ? '已启用所有提醒通知' : '已关闭所有提醒通知'}</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationPreferences({ enabled: !prefs.enabled })}
              className={cn(
                'w-12 h-7 rounded-full transition-all relative',
                prefs.enabled ? 'bg-violet-500' : 'bg-gray-300'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm',
                  prefs.enabled ? 'right-1' : 'left-1'
                )}
              />
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-500" />
              免打扰时段
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">开始时间</label>
                <input
                  type="time"
                  value={prefs.quietHoursStart}
                  onChange={(e) => setNotificationPreferences({ quietHoursStart: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">结束时间</label>
                <input
                  type="time"
                  value={prefs.quietHoursEnd}
                  onChange={(e) => setNotificationPreferences({ quietHoursEnd: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">免打扰时段内不会弹出提醒通知</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              贪睡时长
            </h3>
            <div className="flex gap-2">
              {[5, 10, 15, 30, 60].map((min) => (
                <button
                  key={min}
                  onClick={() => setNotificationPreferences({ snoozeDuration: min })}
                  className={cn(
                    'px-3 py-2 rounded-lg text-xs font-medium transition-all',
                    prefs.snoozeDuration === min
                      ? 'bg-gradient-to-r from-violet-400 to-purple-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {min}分钟
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setNotificationPreferences({ soundEnabled: !prefs.soundEnabled })}
              className={cn(
                'flex items-center gap-2 p-3 rounded-xl transition-all',
                prefs.soundEnabled ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'bg-gray-50 text-gray-400 border border-gray-200'
              )}
            >
              {prefs.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-sm font-medium">声音</span>
            </button>
            <button
              onClick={() => setNotificationPreferences({ vibrationEnabled: !prefs.vibrationEnabled })}
              className={cn(
                'flex items-center gap-2 p-3 rounded-xl transition-all',
                prefs.vibrationEnabled ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'bg-gray-50 text-gray-400 border border-gray-200'
              )}
            >
              <Vibrate className="w-4 h-4" />
              <span className="text-sm font-medium">振动</span>
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-700 mb-3">分类通知设置</h3>
            {allCategories.map((cat) => {
              const meta = categoryMeta[cat];
              const catPref = prefs.categories[cat];
              const isExpanded = expandedCategory === cat;
              return (
                <div key={cat} className="rounded-xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center', meta.gradient)}>
                        <span className="text-white text-xs font-bold">{meta.label[0]}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-800">{meta.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCategoryPref(cat, { enabled: !catPref.enabled });
                        }}
                        className={cn(
                          'w-9 h-5 rounded-full transition-all relative',
                          catPref.enabled ? 'bg-violet-500' : 'bg-gray-300'
                        )}
                      >
                        <div
                          className={cn(
                            'w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all shadow-sm',
                            catPref.enabled ? 'right-[3px]' : 'left-[3px]'
                          )}
                        />
                      </button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-3 border-t border-gray-50 pt-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">提前天数</label>
                        <div className="flex gap-1">
                          {[0, 1, 2, 3, 5, 7].map((d) => (
                            <button
                              key={d}
                              onClick={() => updateCategoryPref(cat, { advanceDays: d })}
                              className={cn(
                                'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                                catPref.advanceDays === d
                                  ? 'bg-violet-500 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              )}
                            >
                              {d === 0 ? '当天' : `${d}天`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">提醒时间</label>
                        <div className="space-y-2">
                          {catPref.times.map((time, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="time"
                                value={time}
                                onChange={(e) => updateTimeInCategory(cat, time, e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-violet-400 outline-none"
                              />
                              {catPref.times.length > 1 && (
                                <button
                                  onClick={() => removeTimeFromCategory(cat, time)}
                                  className="w-6 h-6 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                          {catPref.times.length < 5 && (
                            <button
                              onClick={() => addTimeToCategory(cat)}
                              className="text-xs text-violet-600 font-medium hover:text-violet-700 transition-colors"
                            >
                              + 添加时间
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-violet-400 to-purple-500 text-white py-2.5 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
