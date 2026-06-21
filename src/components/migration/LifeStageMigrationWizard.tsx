import { useState, useMemo } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Briefcase,
  Baby,
  Stethoscope,
  X,
  Database,
  ArrowRightLeft,
  FileCheck,
  PartyPopper,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { LifeStage, MigrationResult } from '@/types';
import { useNavigate } from 'react-router-dom';

type WizardStep = 'select' | 'mapping' | 'preview' | 'migrate' | 'complete';

const targetStages: { stage: LifeStage; label: string; desc: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; route: string }[] = [
  {
    stage: 'career',
    label: '职场期',
    desc: '加班·压力·痛经 交叉关联分析',
    icon: Briefcase,
    color: 'from-lavender-400 to-purple-500',
    bg: 'from-lavender-50 to-purple-50',
    route: '/career',
  },
  {
    stage: 'pregnancy-prep',
    label: '备孕期',
    desc: '排卵追踪·受孕概率·促排管理',
    icon: Baby,
    color: 'from-mint-400 to-emerald-500',
    bg: 'from-mint-50 to-emerald-50',
    route: '/pregnancy-prep',
  },
  {
    stage: 'pregnancy',
    label: '孕期',
    desc: '产检计划·孕周追踪·用药管理',
    icon: Stethoscope,
    color: 'from-sky-400 to-blue-500',
    bg: 'from-sky-50 to-blue-50',
    route: '/pregnancy',
  },
];

const stepLabels: { key: WizardStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'select', label: '选择阶段', icon: Sparkles },
  { key: 'mapping', label: '字段映射', icon: ArrowRightLeft },
  { key: 'preview', label: '迁移预览', icon: Database },
  { key: 'migrate', label: '确认迁移', icon: FileCheck },
  { key: 'complete', label: '完成', icon: PartyPopper },
];

export default function LifeStageMigrationWizard({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const {
    lifeStage,
    getMigrationMapping,
    getMigrationPreview,
    migrateLifeStage,
  } = useAppStore();

  const [currentStep, setCurrentStep] = useState<WizardStep>('select');
  const [selectedTarget, setSelectedTarget] = useState<LifeStage | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);

  const mapping = useMemo(() => {
    if (!selectedTarget) return null;
    return getMigrationMapping(lifeStage, selectedTarget);
  }, [selectedTarget, lifeStage, getMigrationMapping]);

  const preview = useMemo(() => {
    if (!selectedTarget) return null;
    return getMigrationPreview(lifeStage, selectedTarget);
  }, [selectedTarget, lifeStage, getMigrationPreview]);

  const targetConfig = targetStages.find((t) => t.stage === selectedTarget);

  const stepIndex = stepLabels.findIndex((s) => s.key === currentStep);

  const goNext = () => {
    const idx = stepLabels.findIndex((s) => s.key === currentStep);
    if (idx < stepLabels.length - 1) {
      setCurrentStep(stepLabels[idx + 1].key);
    }
  };

  const goBack = () => {
    const idx = stepLabels.findIndex((s) => s.key === currentStep);
    if (idx > 0) {
      setCurrentStep(stepLabels[idx - 1].key);
    }
  };

  const handleMigrate = () => {
    if (!selectedTarget) return;
    const result = migrateLifeStage(selectedTarget);
    setMigrationResult(result);
    setCurrentStep('complete');
  };

  const handleNavigateToTarget = () => {
    if (targetConfig) {
      onClose();
      navigate(targetConfig.route);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center gap-1 mb-6">
      {stepLabels.map((step, idx) => {
        const Icon = step.icon;
        const isActive = step.key === currentStep;
        const isCompleted = idx < stepIndex;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              isActive && 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md',
              isCompleted && 'bg-pink-100 text-pink-600',
              !isActive && !isCompleted && 'bg-gray-100 text-gray-400'
            )}>
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {idx < stepLabels.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-1', isCompleted ? 'bg-pink-300' : 'bg-gray-200')} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderSelectStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-200/50 mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">人生阶段迁移</h2>
        <p className="text-gray-500">从少女期切换至新的人生阶段，历史数据将自动迁移</p>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">当前阶段</p>
            <p className="font-bold text-gray-800">少女期</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-600">选择目标阶段</p>
        {targetStages.map((target) => {
          const Icon = target.icon;
          const isSelected = selectedTarget === target.stage;
          return (
            <button
              key={target.stage}
              onClick={() => setSelectedTarget(target.stage)}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all hover:shadow-md',
                isSelected
                  ? 'border-pink-400 bg-gradient-to-r ' + target.bg + ' shadow-md'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  isSelected
                    ? 'bg-gradient-to-br ' + target.color + ' text-white shadow-md'
                    : 'bg-gray-100 text-gray-400'
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className={cn('font-bold', isSelected ? 'text-gray-800' : 'text-gray-600')}>
                    {target.label}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{target.desc}</p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-pink-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderMappingStep = () => {
    if (!mapping) return null;
    return (
      <div className="space-y-6">
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold text-gray-800 mb-1">{mapping.label}</h2>
          <p className="text-sm text-gray-500">{mapping.description}</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-pink-500" />
            直接映射字段
          </h3>
          <div className="space-y-2">
            {mapping.fieldMappings.map((fm, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-100">
                <div className="flex-1 text-right">
                  <span className="text-sm font-medium text-gray-700">{fm.sourceLabel}</span>
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-50">
                  <ArrowRight className="w-4 h-4 text-pink-400" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">{fm.targetLabel}</span>
                </div>
                <span className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full font-medium',
                  fm.transform === 'direct' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                )}>
                  {fm.transform === 'direct' ? '直传' : fm.transform === 'derive' ? '派生' : '转换'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {mapping.autoDerivedFields.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              自动派生字段
            </h3>
            <div className="space-y-2">
              {mapping.autoDerivedFields.map((field, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-800">{field.targetLabel}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-medium">自动</span>
                  </div>
                  <p className="text-xs text-gray-500">{field.derivation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPreviewStep = () => {
    if (!preview || !targetConfig) return null;
    return (
      <div className="space-y-6">
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold text-gray-800 mb-1">迁移预览</h2>
          <p className="text-sm text-gray-500">确认迁移内容后再执行</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4 text-center">
            <p className="text-3xl font-bold text-pink-600">{preview.sourceDataCount}</p>
            <p className="text-sm text-gray-500 mt-1">源数据条目</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{preview.migratedDataCount}</p>
            <p className="text-sm text-gray-500 mt-1">映射字段数</p>
          </div>
        </div>

        <div className="card p-4 bg-gradient-to-r from-pink-50 to-rose-50">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-700">少女期</span>
            </div>
            <ArrowRight className="w-5 h-5 text-pink-400" />
            <div className="flex items-center gap-2">
              <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center', targetConfig.color)}>
                <targetConfig.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-700">{targetConfig.label}</span>
            </div>
          </div>
        </div>

        {preview.warnings.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              注意事项
            </h3>
            {preview.warnings.map((warning, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800">{warning}</p>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100">
          <div className="flex items-start gap-2">
            <Database className="w-5 h-5 text-sky-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-800 mb-1">数据安全说明</p>
              <p className="text-xs text-gray-600">迁移不会删除少女期的历史数据，所有原始记录将完整保留。你随时可以在各阶段间切换查看。</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMigrateStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-200/50 mx-auto">
        <FileCheck className="w-10 h-10 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">确认迁移</h2>
        <p className="text-gray-500">即将执行人生阶段迁移，请确认以下内容</p>
      </div>

      <div className="card p-4 space-y-3 text-left">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">目标阶段</span>
          <span className="text-sm font-bold text-gray-800">{targetConfig?.label}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">直接映射字段</span>
          <span className="text-sm font-bold text-emerald-600">{mapping?.fieldMappings.length} 项</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">自动派生字段</span>
          <span className="text-sm font-bold text-pink-600">{mapping?.autoDerivedFields.length} 项</span>
        </div>
        {preview && preview.warnings.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">注意事项</span>
            <span className="text-sm font-bold text-amber-600">{preview.warnings.length} 条</span>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
        <p className="text-sm text-rose-700">
          <strong>提示：</strong>迁移后默认阶段将切换为{targetConfig?.label}，但少女期数据不会丢失。
        </p>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200/50 mx-auto">
        <PartyPopper className="w-10 h-10 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">迁移完成！</h2>
        <p className="text-gray-500">已成功从少女期切换至{targetConfig?.label}</p>
      </div>

      {migrationResult && (
        <div className="card p-4 space-y-3 text-left">
          <h3 className="text-sm font-bold text-gray-700 mb-2">迁移报告</h3>
          {migrationResult.migratedFields.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">已迁移字段</p>
              <div className="flex flex-wrap gap-1.5">
                {migrationResult.migratedFields.map((f, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{f}</span>
                ))}
              </div>
            </div>
          )}
          {migrationResult.derivedFields.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">自动派生字段</p>
              <div className="flex flex-wrap gap-1.5">
                {migrationResult.derivedFields.map((f, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">{f}</span>
                ))}
              </div>
            </div>
          )}
          {migrationResult.warnings.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">注意事项</p>
              {migrationResult.warnings.map((w, idx) => (
                <p key={idx} className="text-xs text-amber-700 flex items-start gap-1">
                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                  {w}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 btn-secondary"
        >
          留在当前页
        </button>
        <button
          onClick={handleNavigateToTarget}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all text-white bg-gradient-to-r',
            targetConfig?.color || 'from-pink-400 to-rose-400'
          )}
        >
          前往{targetConfig?.label}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'select': return renderSelectStep();
      case 'mapping': return renderMappingStep();
      case 'preview': return renderPreviewStep();
      case 'migrate': return renderMigrateStep();
      case 'complete': return renderCompleteStep();
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 'select': return selectedTarget !== null;
      case 'mapping': return true;
      case 'preview': return true;
      case 'migrate': return true;
      default: return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-pink-500" />
            人生阶段迁移向导
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {currentStep !== 'complete' && renderStepIndicator()}
        {renderStepContent()}

        {currentStep !== 'complete' && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            {currentStep !== 'select' && (
              <button
                onClick={goBack}
                className="flex items-center gap-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                上一步
              </button>
            )}
            <div className="flex-1" />
            {currentStep === 'migrate' ? (
              <button
                onClick={handleMigrate}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <FileCheck className="w-4 h-4" />
                执行迁移
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={!canGoNext()}
                className={cn(
                  'flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all',
                  canGoNext()
                    ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                )}
              >
                下一步
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
