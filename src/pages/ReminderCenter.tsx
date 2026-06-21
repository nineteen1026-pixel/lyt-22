import { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  AlarmClock,
  Droplets,
  Sparkles,
  Stethoscope,
  Baby,
  Pill,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { categoryMeta, priorityMeta, createCustomRule } from '@/services/reminderRuleEngine';
import NotificationPreferences from '@/components/reminder/NotificationPreferences';
import type { ReminderCategory, ReminderRule, SmartReminder, RuleCondition, RuleOperator, RuleLogicGate, ReminderPriority } from '@/types';

const categoryIcons: Record<ReminderCategory, React.ComponentType<{ className?: string }>> = {
  period: Droplets,
  ovulation: Sparkles,
  prenatal: Stethoscope,
  postpartum: Baby,
  medication: Pill,
  custom: Bell,
};

type TabKey = 'overview' | 'reminders' | 'rules';

const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'overview', label: '调度总览', icon: BellRing },
  { key: 'reminders', label: '提醒列表', icon: AlarmClock },
  { key: 'rules', label: '规则引擎', icon: Zap },
];

export default function ReminderCenter() {
  const {
    smartReminders,
    reminderRules,
    notificationPreferences,
    evaluateRulesAndGenerateReminders,
    getTodayReminders,
    getUpcomingReminders,
    getActiveReminders,
    completeSmartReminder,
    dismissSmartReminder,
    snoozeSmartReminder,
    deleteSmartReminder,
    addReminderRule,
    updateReminderRule,
    deleteReminderRule,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showPrefs, setShowPrefs] = useState(false);
  const [filterCategory, setFilterCategory] = useState<ReminderCategory | 'all'>('all');
  const [showAddRule, setShowAddRule] = useState(false);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  useEffect(() => {
    evaluateRulesAndGenerateReminders();
  }, [evaluateRulesAndGenerateReminders]);

  const todayReminders = getTodayReminders();
  const upcomingReminders = getUpcomingReminders(7);
  const activeReminders = getActiveReminders();

  const completedCount = smartReminders.filter((r) => r.status === 'completed').length;
  const dismissedCount = smartReminders.filter((r) => r.status === 'dismissed').length;
  const activeCount = activeReminders.length;

  const filteredReminders = filterCategory === 'all'
    ? upcomingReminders
    : upcomingReminders.filter((r) => r.category === filterCategory);

  const categoriesWithCount = (['period', 'ovulation', 'prenatal', 'postpartum', 'medication', 'custom'] as ReminderCategory[]).map((cat) => ({
    category: cat,
    count: activeReminders.filter((r) => r.category === cat).length,
    meta: categoryMeta[cat],
  }));

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-violet-50 to-purple-50">
          <div className="flex items-center gap-2 mb-2">
            <BellRing className="w-5 h-5 text-violet-500" />
            <span className="text-xs text-gray-500">待处理</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{activeCount}</p>
        </div>
        <div className="card p-5 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-xs text-gray-500">已完成</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{completedCount}</p>
        </div>
        <div className="card p-5 bg-gradient-to-br from-sky-50 to-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-sky-500" />
            <span className="text-xs text-gray-500">今日提醒</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{todayReminders.length}</p>
        </div>
        <div className="card p-5 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="text-xs text-gray-500">活跃规则</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{reminderRules.filter((r) => r.active).length}</p>
        </div>
      </div>

      {todayReminders.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <AlarmClock className="w-5 h-5 text-violet-500" />
            今日提醒
          </h3>
          <div className="space-y-2">
            {todayReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-bold text-gray-800 mb-3">提醒分类</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {categoriesWithCount.map(({ category, count, meta }) => (
            <button
              key={category}
              onClick={() => {
                setFilterCategory(category);
                setActiveTab('reminders');
              }}
              className="card p-4 text-left card-hover group bg-gradient-to-br"
              style={{}}
            >
              <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', meta.gradient)}>
                {(() => {
                  const Icon = categoryIcons[category];
                  return <Icon className="w-5 h-5 text-white" />;
                })()}
              </div>
              <p className="font-bold text-gray-800 text-sm">{meta.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {count}
                <span className="text-xs font-normal text-gray-500 ml-1">条提醒</span>
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5 bg-gradient-to-br from-indigo-50 to-violet-50">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-500" />
          规则引擎状态
        </h3>
        <div className="space-y-2">
          {reminderRules.slice(0, 5).map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-2 rounded-lg bg-white/70">
              <div className="flex items-center gap-2">
                <div className={cn('w-2 h-2 rounded-full', rule.active ? 'bg-emerald-400' : 'bg-gray-300')} />
                <span className="text-sm text-gray-700">{rule.name}</span>
              </div>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', rule.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400')}>
                {rule.active ? '已启用' : '已禁用'}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setActiveTab('rules')}
          className="mt-3 text-sm text-indigo-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
        >
          查看全部规则 <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  const renderReminders = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setFilterCategory('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                filterCategory === 'all' ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              全部
            </button>
            {(['period', 'ovulation', 'prenatal', 'postpartum', 'medication', 'custom'] as ReminderCategory[]).map((cat) => {
              const meta = categoryMeta[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    filterCategory === cat ? `${meta.color} bg-gradient-to-r ${meta.gradient} text-white` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => evaluateRulesAndGenerateReminders()}
          className="flex items-center gap-1 px-3 py-1.5 bg-violet-50 text-violet-600 rounded-lg text-xs font-medium hover:bg-violet-100 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          刷新
        </button>
      </div>

      {filteredReminders.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">暂无提醒</p>
          <p className="text-xs text-gray-300 mt-1">当有匹配规则的健康事件时，将自动生成提醒</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredReminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>
      )}
    </div>
  );

  const renderRules = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          共 {reminderRules.length} 条规则（{reminderRules.filter((r) => r.active).length} 条启用）
        </p>
        <button
          onClick={() => setShowAddRule(true)}
          className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-violet-400 to-purple-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          新建规则
        </button>
      </div>

      <div className="space-y-2">
        {reminderRules.map((rule) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            expanded={expandedRule === rule.id}
            onToggleExpand={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
            onToggleActive={(active) => updateReminderRule(rule.id, { active })}
            onDelete={() => deleteReminderRule(rule.id)}
          />
        ))}
      </div>

      {showAddRule && (
        <AddRuleModal
          onSave={(rule) => {
            addReminderRule(rule);
            setShowAddRule(false);
          }}
          onClose={() => setShowAddRule(false)}
        />
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 via-purple-400 to-indigo-400 flex items-center justify-center shadow-lg shadow-violet-200/50">
              <BellRing className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-800">智能提醒调度中心</h1>
              <p className="text-gray-500">统一管理经期、排卵、产检、服药等提醒</p>
            </div>
          </div>
          <button
            onClick={() => setShowPrefs(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">通知偏好</span>
          </button>
        </div>
      </div>

      <div className="card p-2 mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'reminders' && renderReminders()}
      {activeTab === 'rules' && renderRules()}

      {showPrefs && <NotificationPreferences onClose={() => setShowPrefs(false)} />}
    </div>
  );
}

function ReminderCard({ reminder }: { reminder: SmartReminder }) {
  const { completeSmartReminder, dismissSmartReminder, snoozeSmartReminder } = useAppStore();
  const meta = categoryMeta[reminder.category];
  const pMeta = priorityMeta[reminder.priority];
  const Icon = categoryIcons[reminder.category];

  const isToday = reminder.date === new Date().toISOString().split('T')[0];

  return (
    <div className={cn('card p-4 bg-gradient-to-r', meta.bg, 'border-l-4', `border-l-${reminder.category === 'period' ? 'rose' : reminder.category === 'ovulation' ? 'amber' : reminder.category === 'prenatal' ? 'sky' : reminder.category === 'postpartum' ? 'fuchsia' : reminder.category === 'medication' ? 'violet' : 'teal'}-400`)}>
      <div className="flex items-start gap-3">
        <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0', meta.gradient)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-800 text-sm truncate">{reminder.title}</h4>
            <span className={cn('text-xs px-1.5 py-0.5 rounded-full flex-shrink-0', pMeta.color, 'bg-opacity-10', `${pMeta.dot}/10`)}>
              {pMeta.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-1 line-clamp-2">{reminder.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{isToday ? '今天' : reminder.date}</span>
            {reminder.time && <span>{reminder.time}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => completeSmartReminder(reminder.id)}
            className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition-colors"
            title="完成"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </button>
          <button
            onClick={() => snoozeSmartReminder(reminder.id, notificationPreferences_from_store().snoozeDuration)}
            className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center hover:bg-amber-100 transition-colors"
            title="贪睡"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </button>
          <button
            onClick={() => dismissSmartReminder(reminder.id)}
            className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="忽略"
          >
            <XCircle className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

function notificationPreferences_from_store() {
  return useAppStore.getState().notificationPreferences;
}

function RuleCard({
  rule,
  expanded,
  onToggleExpand,
  onToggleActive,
  onDelete,
}: {
  rule: ReminderRule;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleActive: (active: boolean) => void;
  onDelete: () => void;
}) {
  const meta = categoryMeta[rule.category];
  const pMeta = priorityMeta[rule.priority];

  return (
    <div className={cn('card overflow-hidden', rule.active ? 'border-l-4 border-l-violet-400' : 'border-l-4 border-l-gray-300 opacity-70')}>
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center', meta.gradient)}>
            <span className="text-white text-xs font-bold">{meta.label[0]}</span>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 text-sm">{rule.name}</span>
              {rule.builtIn && <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-500">内置</span>}
              <span className={cn('text-xs px-1.5 py-0.5 rounded-full', pMeta.color, `${pMeta.dot}/10`)}>{pMeta.label}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{rule.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(!rule.active);
            }}
            className="flex-shrink-0"
          >
            {rule.active ? (
              <ToggleRight className="w-6 h-6 text-violet-500" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-gray-400" />
            )}
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">触发条件</p>
            <div className="flex flex-wrap gap-1">
              {rule.conditions.map((c, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-600">
                  {c.label || `${c.field} ${c.operator} ${c.value}`}
                </span>
              ))}
              <span className="text-xs px-2 py-1 rounded-lg bg-violet-50 text-violet-600">
                {rule.logicGate === 'and' ? '全部满足' : '任一满足'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-gray-50 rounded-lg">
              <p className="text-gray-400">提前天数</p>
              <p className="font-bold text-gray-800">{rule.advanceDays}天</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <p className="text-gray-400">提醒时间</p>
              <p className="font-bold text-gray-800">{rule.time || '默认'}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <p className="text-gray-400">通知分类</p>
              <p className="font-bold text-gray-800">{meta.label}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">提醒模板</p>
            <div className="p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
              <p><strong>标题:</strong> {rule.titleTemplate}</p>
              <p className="mt-1"><strong>描述:</strong> {rule.descriptionTemplate}</p>
            </div>
          </div>

          {!rule.builtIn && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              删除规则
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AddRuleModal({ onSave, onClose }: { onSave: (rule: ReminderRule) => void; onClose: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReminderCategory>('custom');
  const [priority, setPriority] = useState<ReminderPriority>('medium');
  const [titleTemplate, setTitleTemplate] = useState('');
  const [descriptionTemplate, setDescriptionTemplate] = useState('');
  const [advanceDays, setAdvanceDays] = useState(1);
  const [time, setTime] = useState('09:00');
  const [conditions, setConditions] = useState<RuleCondition[]>([]);
  const [logicGate, setLogicGate] = useState<RuleLogicGate>('and');
  const [newCondField, setNewCondField] = useState('');
  const [newCondOperator, setNewCondOperator] = useState<RuleOperator>('gte');
  const [newCondValue, setNewCondValue] = useState('');

  const addCondition = () => {
    if (!newCondField || !newCondValue) return;
    setConditions([...conditions, { field: newCondField, operator: newCondOperator, value: newCondValue }]);
    setNewCondField('');
    setNewCondValue('');
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const rule = createCustomRule({
      name: name || '自定义规则',
      description,
      category,
      priority,
      titleTemplate: titleTemplate || name || '自定义提醒',
      descriptionTemplate: descriptionTemplate || description,
      advanceDays,
      time,
      conditions,
      logicGate,
    });
    onSave(rule);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card p-0 w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">新建自定义规则</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">规则名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：排卵日前5天提醒"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">规则描述</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要说明规则用途"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">分类</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReminderCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 outline-none"
              >
                {(['period', 'ovulation', 'prenatal', 'postpartum', 'medication', 'custom'] as ReminderCategory[]).map((cat) => (
                  <option key={cat} value={cat}>{categoryMeta[cat].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">优先级</label>
              <div className="flex gap-1">
                {(['low', 'medium', 'high', 'urgent'] as ReminderPriority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-xs font-medium transition-all',
                      priority === p ? `${priorityMeta[p].color} bg-gray-800 text-white` : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {priorityMeta[p].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">提前天数</label>
              <input
                type="number"
                min={0}
                max={30}
                value={advanceDays}
                onChange={(e) => setAdvanceDays(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">提醒时间</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">提醒标题模板</label>
            <input
              type="text"
              value={titleTemplate}
              onChange={(e) => setTitleTemplate(e.target.value)}
              placeholder="如：排卵日即将到来"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">支持变量: {'{daysUntilNextPeriod}, {daysUntilOvulation}, {painLevel}'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">提醒描述模板</label>
            <textarea
              value={descriptionTemplate}
              onChange={(e) => setDescriptionTemplate(e.target.value)}
              placeholder="如：预计{daysUntilOvulation}天后排卵"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 outline-none resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">触发条件</label>
              <button
                onClick={() => setLogicGate(logicGate === 'and' ? 'or' : 'and')}
                className={cn(
                  'text-xs px-2 py-1 rounded-lg',
                  logicGate === 'and' ? 'bg-violet-50 text-violet-600' : 'bg-amber-50 text-amber-600'
                )}
              >
                {logicGate === 'and' ? '全部满足 (AND)' : '任一满足 (OR)'}
              </button>
            </div>

            {conditions.length > 0 && (
              <div className="space-y-1 mb-2">
                {conditions.map((cond, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs p-2 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">{cond.field}</span>
                    <span className="text-gray-400">{cond.operator}</span>
                    <span className="text-gray-700">{String(cond.value)}</span>
                    <button onClick={() => removeCondition(i)} className="ml-auto text-red-400 hover:text-red-500">
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-1">
              <input
                type="text"
                value={newCondField}
                onChange={(e) => setNewCondField(e.target.value)}
                placeholder="字段名"
                className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs outline-none"
              />
              <select
                value={newCondOperator}
                onChange={(e) => setNewCondOperator(e.target.value as RuleOperator)}
                className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs outline-none"
              >
                <option value="eq">等于</option>
                <option value="neq">不等于</option>
                <option value="gt">大于</option>
                <option value="gte">≥</option>
                <option value="lt">小于</option>
                <option value="lte">≤</option>
              </select>
              <input
                type="text"
                value={newCondValue}
                onChange={(e) => setNewCondValue(e.target.value)}
                placeholder="值"
                className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs outline-none"
              />
              <button onClick={addCondition} className="px-2 py-1.5 bg-violet-50 text-violet-600 rounded-lg text-xs font-medium hover:bg-violet-100">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              常用字段: daysUntilNextPeriod, isPeriodDay, daysUntilOvulation, isInFertileWindow, todayPainLevel
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary">取消</button>
          <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-violet-400 to-purple-500 text-white px-6 py-2.5 rounded-full font-medium shadow-lg hover:shadow-xl transition-all">
            创建规则
          </button>
        </div>
      </div>
    </div>
  );
}
