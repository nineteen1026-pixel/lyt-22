import { useNutritionStore } from '@/store/useNutritionStore';
import type { LifeStage } from '@/types';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

const lifeStageOptions: { value: LifeStage; label: string; description: string }[] = [
  { value: 'teen', label: '少女期', description: '10-18岁，青春期发育' },
  { value: 'career', label: '职场期', description: '18-35岁，职场打拼' },
  { value: 'pregnancy-prep', label: '备孕期', description: '计划怀孕' },
  { value: 'pregnancy', label: '孕期', description: '怀孕中' },
  { value: 'postpartum', label: '产后恢复', description: '产后6个月内' },
  { value: 'menopause', label: '更年期', description: '45岁以上' },
];

export default function LifeStageSelector() {
  const { selectedLifeStage, setSelectedLifeStage, syncWithAppStoreLifeStage } = useNutritionStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    syncWithAppStoreLifeStage();
  }, [syncWithAppStoreLifeStage]);

  const currentStage = lifeStageOptions.find((s) => s.value === selectedLifeStage);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-rose-200 transition-all"
      >
        <div className="text-left">
          <div className="text-sm font-medium text-gray-800">
            当前阶段：{currentStage?.label}
          </div>
          <div className="text-xs text-gray-500">{currentStage?.description}</div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
            {lifeStageOptions.map((stage) => (
              <button
                key={stage.value}
                onClick={() => {
                  setSelectedLifeStage(stage.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-rose-50 transition-colors ${
                  selectedLifeStage === stage.value
                    ? 'bg-rose-50 border-l-4 border-rose-400'
                    : ''
                }`}
              >
                <div className="font-medium text-gray-800">{stage.label}</div>
                <div className="text-sm text-gray-500">{stage.description}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
