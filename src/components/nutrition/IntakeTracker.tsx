import { useState } from 'react';
import {
  Plus,
  Trash2,
  Clock,
  Flame,
  X,
  Check,
  Coffee,
  UtensilsCrossed,
  Sunset,
  Cookie,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { FoodItem } from '@/types';

const mealTypeConfig = {
  breakfast: { label: '早餐', icon: Coffee, color: 'from-amber-400 to-orange-400', bg: 'from-amber-50 to-orange-50' },
  lunch: { label: '午餐', icon: UtensilsCrossed, color: 'from-emerald-400 to-teal-400', bg: 'from-emerald-50 to-teal-50' },
  dinner: { label: '晚餐', icon: Sunset, color: 'from-violet-400 to-purple-400', bg: 'from-violet-50 to-purple-50' },
  snack: { label: '加餐', icon: Cookie, color: 'from-pink-400 to-rose-400', bg: 'from-pink-50 to-rose-50' },
};

export default function IntakeTracker() {
  const {
    foodItems,
    foodIntakeRecords,
    addFoodIntakeRecord,
    deleteFoodIntakeRecord,
    getDailyNutritionSummary,
  } = useAppStore();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [selectedFoods, setSelectedFoods] = useState<{ foodItemId: string; servings: number }[]>([]);
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const dayRecords = foodIntakeRecords
    .filter((r) => r.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const summary = getDailyNutritionSummary(selectedDate);

  const handleAddFood = (foodId: string) => {
    const existing = selectedFoods.find((f) => f.foodItemId === foodId);
    if (existing) {
      setSelectedFoods(selectedFoods.map((f) =>
        f.foodItemId === foodId ? { ...f, servings: f.servings + 1 } : f
      ));
    } else {
      setSelectedFoods([...selectedFoods, { foodItemId: foodId, servings: 1 }]);
    }
  };

  const handleRemoveFood = (foodId: string) => {
    const existing = selectedFoods.find((f) => f.foodItemId === foodId);
    if (existing && existing.servings > 1) {
      setSelectedFoods(selectedFoods.map((f) =>
        f.foodItemId === foodId ? { ...f, servings: f.servings - 1 } : f
      ));
    } else {
      setSelectedFoods(selectedFoods.filter((f) => f.foodItemId !== foodId));
    }
  };

  const getSelectedFoodServings = (foodId: string) => {
    return selectedFoods.find((f) => f.foodItemId === foodId)?.servings || 0;
  };

  const calculateSelectedNutrition = () => {
    let calories = 0;
    let protein = 0;
    for (const sf of selectedFoods) {
      const food = foodItems.find((f) => f.id === sf.foodItemId);
      if (food) {
        calories += food.calories * sf.servings;
        protein += food.protein * sf.servings;
      }
    }
    return { calories, protein };
  };

  const handleSaveRecord = () => {
    if (selectedFoods.length === 0) return;

    const record = {
      id: Math.random().toString(36).substr(2, 9),
      date: selectedDate,
      time: new Date().toTimeString().slice(0, 5),
      mealType: selectedMealType,
      foodItems: selectedFoods,
      notes: notes || undefined,
    };

    addFoodIntakeRecord(record);
    setSelectedFoods([]);
    setNotes('');
    setShowAddModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const getFoodById = (id: string): FoodItem | undefined => foodItems.find((f) => f.id === id);

  const getRecordNutrition = (record: typeof dayRecords[0]) => {
    let calories = 0;
    let protein = 0;
    for (const item of record.foodItems) {
      const food = getFoodById(item.foodItemId);
      if (food) {
        calories += food.calories * item.servings;
        protein += food.protein * item.servings;
      }
    }
    return { calories: Math.round(calories), protein: Math.round(protein * 10) / 10 };
  };

  const selectedNutrition = calculateSelectedNutrition();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          添加记录
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 bg-gradient-to-br from-orange-50 to-amber-50">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-500">总热量</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{summary.totalCalories} kcal</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-rose-50 to-pink-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-rose-500 font-bold">💪</span>
            <span className="text-sm text-gray-500">蛋白质</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{summary.totalProtein}g</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-amber-50 to-yellow-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-500 font-bold">🌾</span>
            <span className="text-sm text-gray-500">碳水</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{summary.totalCarbs}g</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-500 font-bold">🧈</span>
            <span className="text-sm text-gray-500">脂肪</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{summary.totalFat}g</p>
        </div>
      </div>

      {dayRecords.length > 0 ? (
        <div className="space-y-4">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => {
            const records = dayRecords.filter((r) => r.mealType === mealType);
            if (records.length === 0) return null;

            const config = mealTypeConfig[mealType];
            const Icon = config.icon;

            return (
              <div key={mealType} className="card overflow-hidden">
                <div className={cn('p-4 bg-gradient-to-r', config.bg)}>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br', config.color, 'flex items-center justify-center')}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800">{config.label}</h3>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {records.map((record) => {
                    const nutrition = getRecordNutrition(record);
                    return (
                      <div key={record.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-500">{record.time}</span>
                            <span className="text-sm text-gray-500">·</span>
                            <span className="text-sm font-medium text-gray-700">{nutrition.calories} kcal</span>
                            <span className="text-sm text-gray-500">·</span>
                            <span className="text-sm text-gray-700">{nutrition.protein}g 蛋白</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {record.foodItems.map((item, idx) => {
                              const food = getFoodById(item.foodItemId);
                              return (
                                <span key={idx} className="px-2 py-1 bg-white rounded-lg text-xs text-gray-600">
                                  {food?.name} × {item.servings}
                                </span>
                              );
                            })}
                          </div>
                          {record.notes && (
                            <p className="text-xs text-gray-400 mt-2">备注：{record.notes}</p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteFoodIntakeRecord(record.id)}
                          className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="font-medium text-gray-600 mb-2">还没有记录</h3>
          <p className="text-sm text-gray-400 mb-4">点击右上角按钮添加今天的第一餐吧</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            开始记录
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">添加饮食记录</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedFoods([]);
                    setNotes('');
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">餐次</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => {
                    const config = mealTypeConfig[type];
                    const Icon = config.icon;
                    const isActive = selectedMealType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedMealType(type)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-3 rounded-xl transition-all',
                          isActive
                            ? cn('bg-gradient-to-br', config.color, 'text-white shadow-md')
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">选择食物</label>
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {foodItems.map((food) => {
                    const servings = getSelectedFoodServings(food.id);
                    return (
                      <div
                        key={food.id}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-xl border-2 transition-all',
                          servings > 0 ? 'border-rose-300 bg-rose-50' : 'border-gray-100 bg-white hover:border-gray-200'
                        )}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{food.name}</p>
                          <p className="text-xs text-gray-400">
                            {food.calories}kcal · {food.protein}g蛋白 · {food.servingSize}
                          </p>
                        </div>
                        {servings > 0 ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRemoveFood(food.id)}
                              className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200 transition-colors"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-medium text-gray-800">{servings}</span>
                            <button
                              onClick={() => handleAddFood(food.id)}
                              className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddFood(food.id)}
                            className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedFoods.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-800 mb-3">已选食物</h4>
                  <div className="space-y-2">
                    {selectedFoods.map((sf) => {
                      const food = getFoodById(sf.foodItemId);
                      return (
                        <div key={sf.foodItemId} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{food?.name} × {sf.servings}</span>
                          <span className="text-gray-500">{Math.round((food?.calories || 0) * sf.servings)} kcal</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <span className="font-medium text-gray-800">合计</span>
                    <span className="font-bold text-rose-600">
                      {selectedNutrition.calories} kcal · {Math.round(selectedNutrition.protein)}g 蛋白
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">备注（可选）</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="记录一下用餐感受..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedFoods([]);
                  setNotes('');
                }}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSaveRecord}
                disabled={selectedFoods.length === 0}
                className={cn(
                  'flex-1 px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2',
                  selectedFoods.length > 0
                    ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                <Check className="w-4 h-4" />
                保存记录
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">记录已保存</span>
          </div>
        </div>
      )}
    </div>
  );
}
