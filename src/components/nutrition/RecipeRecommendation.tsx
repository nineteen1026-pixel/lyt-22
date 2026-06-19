import { useState } from 'react';
import {
  Clock,
  Flame,
  ChefHat,
  Tag,
  X,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { Recipe } from '@/types';

const categoryLabels: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
};

const difficultyLabels: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

const lifeStageLabels: Record<string, string> = {
  teen: '少女期',
  career: '职场期',
  'pregnancy-prep': '备孕期',
  pregnancy: '孕期',
  postpartum: '产后恢复',
  menopause: '更年期',
};

export default function RecipeRecommendation() {
  const { lifeStage, getRecipesByLifeStage, addFoodIntakeRecord, foodItems } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showAddSuccess, setShowAddSuccess] = useState(false);

  const recipes = getRecipesByLifeStage(lifeStage);
  const filteredRecipes = selectedCategory === 'all'
    ? recipes
    : recipes.filter((r) => r.category === selectedCategory);

  const categories = ['all', 'breakfast', 'lunch', 'dinner', 'snack'];

  const handleAddToRecord = (recipe: Recipe) => {
    const mealType = recipe.category === 'snack' ? 'snack' : recipe.category;
    const record = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      foodItems: recipe.ingredients
        .filter((_, i) => i < 3)
        .map((ing) => {
          const matchedFood = foodItems.find((f) =>
            ing.name.includes(f.name) || f.name.includes(ing.name)
          );
          return {
            foodItemId: matchedFood?.id || foodItems[0].id,
            servings: 1,
          };
        }),
      notes: `添加食谱：${recipe.name}`,
    };
    addFoodIntakeRecord(record);
    setShowAddSuccess(true);
    setTimeout(() => setShowAddSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              selectedCategory === cat
                ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            )}
          >
            {cat === 'all' ? '全部' : categoryLabels[cat]}
          </button>
        ))}
      </div>

      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
        <p className="text-sm text-emerald-700">
          💡 当前阶段：<strong>{lifeStageLabels[lifeStage]}</strong>，为您推荐 {recipes.length} 道适合的食谱
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="card overflow-hidden card-hover group"
          >
            <div className="relative">
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-orange-600">
                  {categoryLabels[recipe.category]}
                </span>
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-emerald-600">
                  {difficultyLabels[recipe.difficulty]}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-gray-800 mb-2">{recipe.name}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{recipe.description}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {recipe.cookTime}分钟
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  {recipe.calories}kcal
                </span>
                <span className="flex items-center gap-1">
                  <ChefHat className="w-4 h-4" />
                  {recipe.protein}g蛋白
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-4 text-xs">
                <div className="bg-rose-50 rounded-lg p-2">
                  <p className="font-bold text-rose-600">{recipe.protein}g</p>
                  <p className="text-gray-500">蛋白质</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-2">
                  <p className="font-bold text-amber-600">{recipe.carbs}g</p>
                  <p className="text-gray-500">碳水</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2">
                  <p className="font-bold text-blue-600">{recipe.fat}g</p>
                  <p className="text-gray-500">脂肪</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedRecipe(recipe)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  查看详情
                </button>
                <button
                  onClick={() => handleAddToRecord(recipe)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all flex items-center justify-center gap-1"
                >
                  添加记录
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.name}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-orange-100 rounded-full text-xs font-medium text-orange-600">
                  {categoryLabels[selectedRecipe.category]}
                </span>
                <span className="px-2 py-1 bg-emerald-100 rounded-full text-xs font-medium text-emerald-600">
                  {difficultyLabels[selectedRecipe.difficulty]}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedRecipe.name}</h2>
              <p className="text-gray-500 mb-4">{selectedRecipe.description}</p>

              <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedRecipe.cookTime}分钟
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  {selectedRecipe.calories}kcal
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-orange-600">{selectedRecipe.calories}</p>
                  <p className="text-xs text-gray-500">卡路里</p>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-rose-600">{selectedRecipe.protein}g</p>
                  <p className="text-xs text-gray-500">蛋白质</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-amber-600">{selectedRecipe.carbs}g</p>
                  <p className="text-xs text-gray-500">碳水</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-blue-600">{selectedRecipe.fat}g</p>
                  <p className="text-xs text-gray-500">脂肪</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-orange-500" />
                  食材清单
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                        <Check className="w-3 h-3 text-orange-500" />
                      </div>
                      <span className="text-sm text-gray-700">
                        {ing.name} <span className="text-gray-400">{ing.amount}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-orange-500" />
                  制作步骤
                </h3>
                <div className="space-y-3">
                  {selectedRecipe.instructions.map((step, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-gray-600 pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="flex-1 btn-secondary"
                >
                  关闭
                </button>
                <button
                  onClick={() => {
                    handleAddToRecord(selectedRecipe);
                    setSelectedRecipe(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-orange-400 to-amber-400 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  添加到今日记录
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">已添加到今日摄入记录</span>
          </div>
        </div>
      )}
    </div>
  );
}
