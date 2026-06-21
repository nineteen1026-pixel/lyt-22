import { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Clock,
  User,
  Users,
  X,
  Pill,
  UtensilsCrossed,
  Stethoscope,
  Smile,
  Dumbbell,
  Leaf,
  Tag,
  EyeOff,
  Lock,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type {
  PartnerPrepTask,
  PartnerTaskCategory,
  PartnerTaskAssignee,
  PartnerTaskPriority,
  PartnerPrepPermissionConfig,
} from '@/types';

const categoryConfig: Record<PartnerTaskCategory, { label: string; icon: typeof Pill; color: string; bg: string }> = {
  medication: { label: '用药', icon: Pill, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  lifestyle: { label: '生活方式', icon: Leaf, color: 'text-teal-600', bg: 'bg-teal-100' },
  checkup: { label: '检查', icon: Stethoscope, color: 'text-sky-600', bg: 'bg-sky-100' },
  nutrition: { label: '营养', icon: UtensilsCrossed, color: 'text-amber-600', bg: 'bg-amber-100' },
  emotion: { label: '情绪', icon: Smile, color: 'text-pink-600', bg: 'bg-pink-100' },
  exercise: { label: '运动', icon: Dumbbell, color: 'text-violet-600', bg: 'bg-violet-100' },
  other: { label: '其他', icon: Tag, color: 'text-gray-600', bg: 'bg-gray-100' },
};

const assigneeLabels: Record<PartnerTaskAssignee, { label: string; icon: typeof User; color: string }> = {
  female: { label: '女方', icon: User, color: 'from-rose-400 to-pink-500' },
  partner: { label: '伴侣', icon: User, color: 'from-sky-400 to-blue-500' },
  both: { label: '双方', icon: Users, color: 'from-mint-400 to-emerald-500' },
};

const priorityConfig: Record<PartnerTaskPriority, { label: string; color: string }> = {
  high: { label: '高优先级', color: 'text-rose-600 bg-rose-100' },
  medium: { label: '中优先级', color: 'text-amber-600 bg-amber-100' },
  low: { label: '低优先级', color: 'text-gray-500 bg-gray-100' },
};

const recurringLabels: Record<'daily' | 'weekly' | 'monthly' | 'none', string> = {
  daily: '每日',
  weekly: '每周',
  monthly: '每月',
  none: '',
};

export default function PartnerTaskBoard({
  viewRole,
  canEdit,
  permissions,
}: {
  viewRole: 'female' | 'partner';
  canEdit: boolean;
  permissions: PartnerPrepPermissionConfig;
}) {
  const {
    partnerPrepState,
    addPartnerPrepTask,
    togglePartnerPrepTask,
    deletePartnerPrepTask,
  } = useAppStore();

  const [showAdd, setShowAdd] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState<PartnerTaskAssignee | 'all'>('all');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'lifestyle' as PartnerTaskCategory,
    assignee: 'both' as PartnerTaskAssignee,
    priority: 'medium' as PartnerTaskPriority,
    dueDate: new Date().toISOString().split('T')[0],
    recurring: 'none' as PartnerPrepTask['recurring'],
  });

  const tasks = partnerPrepState.tasks;
  const filteredTasks = filterAssignee === 'all'
    ? tasks
    : filterAssignee === 'both'
    ? tasks.filter((t) => t.assignee === 'both')
    : tasks.filter((t) => t.assignee === filterAssignee || t.assignee === 'both');

  const pendingTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  const canSeeDetails = permissions.task_details;
  const canToggle = permissions.task_completion && canEdit;
  const canAddNew = viewRole === 'female';

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    addPartnerPrepTask({
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      category: newTask.category,
      assignee: newTask.assignee,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      completed: false,
      recurring: newTask.recurring,
    });
    setNewTask({
      title: '',
      description: '',
      category: 'lifestyle',
      assignee: 'both',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      recurring: 'none',
    });
    setShowAdd(false);
  };

  const assigneeFilterOptions: { key: PartnerTaskAssignee | 'all'; label: string }[] = [
    { key: 'all', label: '全部任务' },
    { key: 'female', label: '女方任务' },
    { key: 'partner', label: '伴侣任务' },
    { key: 'both', label: '共同任务' },
  ];

  function renderTaskCard(task: PartnerPrepTask, isCompleted: boolean) {
    const cat = categoryConfig[task.category];
    const assign = assigneeLabels[task.assignee];
    const pri = priorityConfig[task.priority];
    const CatIcon = cat.icon;
    const recurringLabel = task.recurring ? recurringLabels[task.recurring] : '';

    return (
      <div
        key={task.id}
        className={cn(
          'card p-4 transition-shadow',
          !isCompleted && 'hover:shadow-md',
          isCompleted && 'opacity-60'
        )}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => canToggle && togglePartnerPrepTask(task.id, viewRole)}
            disabled={!canToggle}
            className={cn(
              'mt-0.5 flex-shrink-0 transition-all',
              canToggle ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
            )}
            title={!canToggle && viewRole === 'partner' ? '未被授权操作任务' : undefined}
          >
            {isCompleted ? (
              <CheckSquare className={cn('w-5 h-5', canToggle ? 'text-mint-500' : 'text-gray-400')} />
            ) : (
              <Square className={cn('w-5 h-5', canToggle ? 'text-gray-300 hover:text-mint-500' : 'text-gray-300')} />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                'font-medium',
                isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'
              )}>
                {task.title}
              </span>

              {canSeeDetails ? (
                <>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', cat.bg, cat.color)}>
                    <CatIcon className="w-3 h-3 inline mr-0.5" />{cat.label}
                  </span>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', pri.color)}>
                    {pri.label}
                  </span>
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full text-white bg-gradient-to-r',
                    assign.color
                  )}>
                    {assign.label}
                  </span>
                  {recurringLabel && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-mint-50 text-mint-600">
                      <Clock className="w-3 h-3 inline mr-0.5" />{recurringLabel}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  详情受限
                </span>
              )}
            </div>

            {canSeeDetails && task.description && (
              <p className="text-xs text-gray-500 mt-1">{task.description}</p>
            )}

            {canSeeDetails && (
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                <span>截止: {task.dueDate.slice(5)}</span>
                {task.notes && <span>· 备注: {task.notes}</span>}
              </div>
            )}

            {isCompleted && task.completedBy && canSeeDetails && (
              <span className="mt-1 inline-block text-[10px] text-gray-400">
                由{task.completedBy === 'female' ? '女方' : '伴侣'}完成
              </span>
            )}
          </div>

          {!isCompleted && canAddNew && (
            <button
              onClick={() => deletePartnerPrepTask(task.id)}
              className="text-gray-300 hover:text-rose-500 transition-colors flex-shrink-0"
              title="删除任务"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-mint-200/50">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">备孕任务板</h3>
            <p className="text-xs text-gray-500">
              {pendingTasks.length} 项待完成 · {completedTasks.length} 项已完成
              {!canSeeDetails && viewRole === 'partner' && (
                <span className="ml-2 text-amber-500 flex items-center gap-1 inline-flex">
                  <EyeOff className="w-3 h-3" />
                  详情权限受限
                </span>
              )}
              {!canToggle && viewRole === 'partner' && (
                <span className="ml-2 text-sky-500 flex items-center gap-1 inline-flex">
                  <Lock className="w-3 h-3" />
                  无操作权限
                </span>
              )}
            </p>
          </div>
        </div>
        {canAddNew && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-mint-400 to-emerald-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            新增任务
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {assigneeFilterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilterAssignee(opt.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
              filterAssignee === opt.key
                ? 'bg-gradient-to-r from-mint-400 to-emerald-500 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-mint-300'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="card p-5 border-2 border-mint-200 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-800">新增备孕任务</h4>
            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">任务名称 *</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="例如：服用叶酸"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">截止日期</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">描述</label>
              <input
                type="text"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="可选描述"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">分类</label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value as PartnerTaskCategory })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none text-sm bg-white"
              >
                {Object.entries(categoryConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">负责人</label>
              <select
                value={newTask.assignee}
                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value as PartnerTaskAssignee })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none text-sm bg-white"
              >
                {Object.entries(assigneeLabels).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">优先级</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as PartnerTaskPriority })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none text-sm bg-white"
              >
                {Object.entries(priorityConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">重复</label>
              <select
                value={newTask.recurring}
                onChange={(e) => setNewTask({ ...newTask, recurring: e.target.value as PartnerPrepTask['recurring'] })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none text-sm bg-white"
              >
                <option value="none">不重复</option>
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm px-4 py-2">取消</button>
            <button
              onClick={handleAddTask}
              disabled={!newTask.title.trim()}
              className="px-4 py-2 bg-gradient-to-r from-mint-400 to-emerald-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              添加
            </button>
          </div>
        </div>
      )}

      {pendingTasks.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-600 mb-1">待完成 ({pendingTasks.length})</h4>
          {pendingTasks.map((task) => renderTaskCard(task, false))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 text-mint-300" />
          <p className="text-gray-500">暂无待完成任务</p>
          {canAddNew && (
            <button onClick={() => setShowAdd(true)} className="text-mint-600 font-medium mt-2 text-sm">
              + 添加新任务
            </button>
          )}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4" />已完成 ({completedTasks.length})
          </h4>
          <div className="space-y-1.5">
            {completedTasks.map((task) => renderTaskCard(task, true))}
          </div>
        </div>
      )}
    </div>
  );
}
