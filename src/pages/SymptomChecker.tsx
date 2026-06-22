import { useState, useMemo } from 'react';
import {
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  Clock,
  Stethoscope,
  Home,
  RefreshCw,
  Shield,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  symptomCategories,
  symptoms,
  possibleConditions,
  urgencyGuidance,
  selfCareAdvices,
  getSymptomById,
} from '@/mock/symptomDatabase';
import type {
  SymptomCategoryType,
  SelectedSymptom,
  SymptomCheckResult,
  PossibleCondition,
  UrgencyLevel,
} from '@/types';

type Step = 'category' | 'symptoms' | 'severity' | 'result';

export default function SymptomChecker() {
  const [currentStep, setCurrentStep] = useState<Step>('category');
  const [selectedCategory, setSelectedCategory] = useState<SymptomCategoryType | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SelectedSymptom[]>([]);
  const [result, setResult] = useState<SymptomCheckResult | null>(null);

  const filteredSymptoms = useMemo(() => {
    if (!selectedCategory) return [];
    let filtered = symptoms.filter((s) => s.category === selectedCategory);
    if (selectedSubcategory) {
      filtered = filtered.filter((s) => s.subcategory === selectedSubcategory);
    }
    return filtered;
  }, [selectedCategory, selectedSubcategory]);

  const currentCategory = symptomCategories.find((c) => c.id === selectedCategory);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptomIds((prev) => {
      if (prev.includes(symptomId)) {
        return prev.filter((id) => id !== symptomId);
      }
      return [...prev, symptomId];
    });
  };

  const goToSeverity = () => {
    const initialSeverities: SelectedSymptom[] = selectedSymptomIds.map((id) => ({
      symptomId: id,
      severity: 'mild',
    }));
    setSelectedSymptoms(initialSeverities);
    setCurrentStep('severity');
  };

  const updateSeverity = (symptomId: string, severity: 'mild' | 'moderate' | 'severe') => {
    setSelectedSymptoms((prev) =>
      prev.map((s) =>
        s.symptomId === symptomId ? { ...s, severity } : s
      )
    );
  };

  const calculateResult = () => {
    const symptomIds = selectedSymptoms.map((s) => s.symptomId).sort().join(',');
    const hasSevere = selectedSymptoms.some((s) => s.severity === 'severe');
    const hasModerate = selectedSymptoms.some((s) => s.severity === 'moderate');

    let matchedConditions: PossibleCondition[] = [];
    for (const [key, conditions] of Object.entries(possibleConditions)) {
      const keyIds = key.split(',');
      const matchedCount = keyIds.filter((id) => symptomIds.includes(id)).length;
      if (matchedCount >= Math.min(keyIds.length, 2)) {
        matchedConditions = [...matchedConditions, ...conditions];
      }
    }

    if (matchedConditions.length === 0) {
      matchedConditions = [
        {
          id: 'general',
          name: '一般不适',
          description: '根据您描述的症状，可能是常见的身体不适。建议注意休息，密切观察症状变化。',
          probability: 60,
          urgency: hasSevere ? 'consult' : hasModerate ? 'observation' : 'normal',
          matchingSymptoms: selectedSymptoms.map((s) => getSymptomById(s.symptomId)?.name || ''),
          keySymptoms: ['症状较轻', '无明显危险信号'],
        },
      ];
    }

    matchedConditions = matchedConditions
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);

    let overallUrgency: UrgencyLevel = 'normal';
    const urgencyOrder: UrgencyLevel[] = ['normal', 'observation', 'consult', 'urgent', 'emergency'];
    matchedConditions.forEach((c) => {
      if (urgencyOrder.indexOf(c.urgency) > urgencyOrder.indexOf(overallUrgency)) {
        overallUrgency = c.urgency;
      }
    });

    if (hasSevere && urgencyOrder.indexOf(overallUrgency) < urgencyOrder.indexOf('consult')) {
      overallUrgency = 'consult';
    }

    const guidance = { ...urgencyGuidance[overallUrgency] };
    const advices = selfCareAdvices[overallUrgency] || [];

    const checkResult: SymptomCheckResult = {
      selectedSymptoms,
      possibleConditions: matchedConditions,
      overallUrgency,
      medicalGuidance: guidance,
      selfCareAdvices: advices,
      relatedKnowledgeIds: [],
      generatedAt: new Date().toISOString(),
    };

    setResult(checkResult);
    setCurrentStep('result');
  };

  const resetCheck = () => {
    setCurrentStep('category');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedSymptomIds([]);
    setSelectedSymptoms([]);
    setResult(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'from-emerald-400 to-teal-500';
      case 'moderate':
        return 'from-amber-400 to-orange-500';
      case 'severe':
        return 'from-rose-400 to-red-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'mild':
        return '轻微';
      case 'moderate':
        return '中等';
      case 'severe':
        return '严重';
      default:
        return '';
    }
  };

  const renderCategoryStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-200/50">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">症状自查</h2>
        <p className="text-gray-500">选择您不适的症状类别，开始智能评估</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {symptomCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => {
              setSelectedCategory(category.id);
              setSelectedSubcategory(null);
              setCurrentStep('symptoms');
            }}
            className="card p-5 text-left card-hover group"
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0',
                  `bg-gradient-to-br ${category.gradient}`
                )}
              >
                {category.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-1">{category.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{category.description}</p>
                <div className="flex flex-wrap gap-1">
                  {category.subcategories.slice(0, 3).map((sub) => (
                    <span
                      key={sub.id}
                      className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
                    >
                      {sub.name}
                    </span>
                  ))}
                  {category.subcategories.length > 3 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                      +{category.subcategories.length - 3}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">温馨提示</p>
            <p className="text-xs text-amber-600 mt-1">
              本工具仅供参考，不能替代专业医生诊断。如有严重症状或持续不适，请及时就医。
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSymptomsStep = () => (
    <div className="space-y-6">
      <button
        onClick={() => {
          setCurrentStep('category');
          setSelectedCategory(null);
          setSelectedSubcategory(null);
        }}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        返回类别选择
      </button>

      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center text-3xl',
            `bg-gradient-to-br ${currentCategory?.gradient}`
          )}
        >
          {currentCategory?.icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{currentCategory?.name}</h2>
          <p className="text-sm text-gray-500">选择您正在经历的症状（可多选）</p>
        </div>
      </div>

      {currentCategory && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSubcategory(null)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              !selectedSubcategory
                ? `bg-gradient-to-r ${currentCategory.gradient} text-white shadow-md`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            全部
          </button>
          {currentCategory.subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubcategory(sub.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                selectedSubcategory === sub.id
                  ? `bg-gradient-to-r ${currentCategory.gradient} text-white shadow-md`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredSymptoms.map((symptom) => {
          const isSelected = selectedSymptomIds.includes(symptom.id);
          return (
            <button
              key={symptom.id}
              onClick={() => toggleSymptom(symptom.id)}
              className={cn(
                'card p-4 text-left transition-all',
                isSelected
                  ? `border-2 border-pink-400 bg-pink-50/50`
                  : 'border border-gray-100 hover:border-gray-200'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-lg',
                    isSelected
                      ? 'bg-gradient-to-br from-pink-400 to-rose-500'
                      : 'bg-gray-100'
                  )}
                >
                  {isSelected ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <span>{symptom.icon}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'font-medium text-sm',
                    isSelected ? 'text-pink-700' : 'text-gray-800'
                  )}>
                    {symptom.name}
                  </p>
                  {symptom.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {symptom.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          已选择 <span className="font-bold text-pink-500">{selectedSymptomIds.length}</span> 个症状
        </p>
        <button
          onClick={goToSeverity}
          disabled={selectedSymptomIds.length === 0}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all',
            selectedSymptomIds.length > 0
              ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          下一步
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderSeverityStep = () => (
    <div className="space-y-6">
      <button
        onClick={() => setCurrentStep('symptoms')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        返回症状选择
      </button>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">症状严重程度</h2>
        <p className="text-sm text-gray-500">请评估每个症状的严重程度，帮助我们更准确地判断</p>
      </div>

      <div className="space-y-4">
        {selectedSymptoms.map((sel) => {
          const symptom = getSymptomById(sel.symptomId);
          if (!symptom) return null;
          return (
            <div key={sel.symptomId} className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{symptom.icon}</span>
                <p className="font-medium text-gray-800">{symptom.name}</p>
              </div>
              <div className="flex gap-2">
                {(['mild', 'moderate', 'severe'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => updateSeverity(sel.symptomId, level)}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all',
                      sel.severity === level
                        ? `bg-gradient-to-r ${getSeverityColor(level)} text-white shadow-md`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {getSeverityLabel(level)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 text-right">
                {sel.severity === 'mild' && '症状轻微，不影响日常生活'}
                {sel.severity === 'moderate' && '症状明显，部分影响日常生活'}
                {sel.severity === 'severe' && '症状严重，明显影响日常生活'}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={() => setCurrentStep('symptoms')}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          上一步
        </button>
        <button
          onClick={calculateResult}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-lg hover:shadow-xl transition-all"
        >
          生成评估报告
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderResultStep = () => {
    if (!result) return null;
    const { medicalGuidance, possibleConditions, selfCareAdvices } = result;

    return (
      <div className="space-y-6">
        <div className={cn(
          'card p-6 bg-gradient-to-r text-white relative overflow-hidden',
          medicalGuidance.urgencyBg
        )}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              {result.overallUrgency === 'emergency' || result.overallUrgency === 'urgent' ? (
                <AlertTriangle className="w-8 h-8" />
              ) : result.overallUrgency === 'consult' ? (
                <Stethoscope className="w-8 h-8" />
              ) : (
                <Shield className="w-8 h-8" />
              )}
              <div>
                <p className="text-white/80 text-sm">评估结果</p>
                <h2 className="text-2xl font-bold">{medicalGuidance.urgencyLabel}</h2>
              </div>
            </div>
            <p className="text-white/90">{medicalGuidance.description}</p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-pink-500" />
            可能的情况
          </h3>
          <div className="space-y-3">
            {possibleConditions.map((condition) => (
              <div
                key={condition.id}
                className="p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="font-medium text-gray-800">{condition.name}</h4>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          condition.probability > 70
                            ? 'bg-rose-500'
                            : condition.probability > 40
                            ? 'bg-amber-500'
                            : 'bg-sky-500'
                        )}
                        style={{ width: `${condition.probability}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right">{condition.probability}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{condition.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {condition.matchingSymptoms.slice(0, 4).map((symptom, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-600"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            就医指引
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm font-medium text-amber-800 mb-2">建议行动</p>
              <p className="text-sm text-amber-700">{medicalGuidance.recommendedAction}</p>
            </div>
            
            {medicalGuidance.recommendedDepartment && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">建议就诊科室</p>
                  <p className="font-medium text-gray-800">{medicalGuidance.recommendedDepartment}</p>
                </div>
              </div>
            )}

            {medicalGuidance.timeFrame && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">建议就医时间</p>
                  <p className="font-medium text-gray-800">{medicalGuidance.timeFrame}</p>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">⚠️ 需要警惕的危险信号</p>
              <ul className="space-y-1">
                {medicalGuidance.warningSigns.map((sign, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    {sign}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">📋 就医前准备</p>
              <ul className="space-y-1">
                {medicalGuidance.preparationTips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-sky-500 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {selfCareAdvices.length > 0 && (
          <div className="card p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              自我护理建议
            </h3>
            <div className="space-y-4">
              {selfCareAdvices.map((advice) => (
                <div key={advice.id} className="p-4 rounded-xl bg-pink-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    {advice.category === 'rest' && <span>😴</span>}
                    {advice.category === 'diet' && <span>🥗</span>}
                    {advice.category === 'hygiene' && <span>🧼</span>}
                    {advice.category === 'medication' && <span>💊</span>}
                    {advice.category === 'lifestyle' && <span>🌟</span>}
                    <p className="font-medium text-gray-800">{advice.title}</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{advice.description}</p>
                  <ol className="space-y-1">
                    {advice.steps.map((step, idx) => (
                      <li key={idx} className="text-sm text-gray-500 flex items-start gap-2">
                        <span className="text-pink-500 font-medium">{idx + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={resetCheck}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            重新自查
          </button>
          <button
            onClick={() => {
              resetCheck();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-sm bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Home className="w-4 h-4" />
            返回首页
          </button>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-600">免责声明</p>
              <p className="text-xs text-gray-500 mt-1">
                本工具基于常见症状模式提供参考建议，不能替代专业医生的诊断和治疗。
                如有任何疑问或症状加重，请及时就医咨询。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {currentStep !== 'category' && currentStep !== 'result' && (
          <div className="mb-6">
            <div className="flex items-center gap-2">
              {['类别', '症状', '程度', '结果'].map((label, idx) => {
                const steps: Step[] = ['category', 'symptoms', 'severity', 'result'];
                const currentIdx = steps.indexOf(currentStep);
                const isActive = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all',
                        isCurrent
                          ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-md'
                          : isActive
                          ? 'bg-pink-100 text-pink-600'
                          : 'bg-gray-100 text-gray-400'
                      )}
                    >
                      {isActive && idx < currentIdx ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        isCurrent ? 'text-pink-600' : isActive ? 'text-gray-600' : 'text-gray-400'
                      )}
                    >
                      {label}
                    </span>
                    {idx < 3 && (
                      <div
                        className={cn(
                          'w-8 h-0.5',
                          isActive ? 'bg-pink-300' : 'bg-gray-200'
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="card p-6 md:p-8">
          {currentStep === 'category' && renderCategoryStep()}
          {currentStep === 'symptoms' && renderSymptomsStep()}
          {currentStep === 'severity' && renderSeverityStep()}
          {currentStep === 'result' && renderResultStep()}
        </div>
      </div>
    </div>
  );
}
