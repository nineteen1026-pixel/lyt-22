import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  LifeStage,
  FoodItem,
  Recipe,
  FoodIntakeRecord,
  NutrientRDAByStage,
  DailyNutritionSummary,
  NutrientGapItem,
} from '@/types';
import {
  mockFoodItems,
  mockRecipes,
  mockFoodIntakeRecords,
  mockNutrientRDAs,
  nutrientNames,
  nutrientUnits,
  nutrientCategories,
} from '@/mock/nutrition';

const generateId = () => Math.random().toString(36).substr(2, 9);

export interface NutritionState {
  foodItems: FoodItem[];
  recipes: Recipe[];
  foodIntakeRecords: FoodIntakeRecord[];
  nutrientRDAs: NutrientRDAByStage[];
  selectedLifeStage: LifeStage;
  setSelectedLifeStage: (stage: LifeStage) => void;
  addFoodIntakeRecord: (record: Omit<FoodIntakeRecord, 'id'>) => void;
  deleteFoodIntakeRecord: (id: string) => void;
  getRecipesByLifeStage: (stage: LifeStage) => Recipe[];
  getDailyNutritionSummary: (date: string) => DailyNutritionSummary;
  getNutrientGapAnalysis: (date: string) => NutrientGapItem[];
  getWeeklyNutritionTrend: () => { date: string; calories: number; protein: number }[];
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      foodItems: mockFoodItems,
      recipes: mockRecipes,
      foodIntakeRecords: mockFoodIntakeRecords,
      nutrientRDAs: mockNutrientRDAs,
      selectedLifeStage: 'teen',

      setSelectedLifeStage: (stage: LifeStage) => set({ selectedLifeStage: stage }),

      addFoodIntakeRecord: (record) =>
        set((state) => ({
          foodIntakeRecords: [...state.foodIntakeRecords, { ...record, id: generateId() }],
        })),

      deleteFoodIntakeRecord: (id: string) =>
        set((state) => ({
          foodIntakeRecords: state.foodIntakeRecords.filter((r) => r.id !== id),
        })),

      getRecipesByLifeStage: (stage: LifeStage) => {
        const { recipes } = get();
        return recipes.filter((r) => r.lifeStages.includes(stage));
      },

      getDailyNutritionSummary: (date: string) => {
        const { foodIntakeRecords, foodItems } = get();
        const dayRecords = foodIntakeRecords.filter((r) => r.date === date);

        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        const nutrientMap = new Map<string, number>();

        for (const record of dayRecords) {
          for (const item of record.foodItems) {
            const food = foodItems.find((f) => f.id === item.foodItemId);
            if (food) {
              totalCalories += food.calories * item.servings;
              totalProtein += food.protein * item.servings;
              totalCarbs += food.carbs * item.servings;
              totalFat += food.fat * item.servings;

              for (const n of food.nutrients) {
                const current = nutrientMap.get(n.nutrientId) || 0;
                nutrientMap.set(n.nutrientId, current + n.amount * item.servings);
              }
            }
          }
        }

        return {
          date,
          totalCalories: Math.round(totalCalories),
          totalProtein: Math.round(totalProtein * 10) / 10,
          totalCarbs: Math.round(totalCarbs * 10) / 10,
          totalFat: Math.round(totalFat * 10) / 10,
          nutrients: Array.from(nutrientMap.entries()).map(([nutrientId, amount]) => ({
            nutrientId,
            amount: Math.round(amount * 10) / 10,
          })),
        };
      },

      getNutrientGapAnalysis: (date: string) => {
        const { nutrientRDAs, selectedLifeStage, getDailyNutritionSummary } = get();
        const summary = getDailyNutritionSummary(date);
        const stageRDA = nutrientRDAs.find((n) => n.lifeStage === selectedLifeStage);

        if (!stageRDA) return [];

        const result = [];
        for (const rdaItem of stageRDA.nutrients) {
          const currentNutrient = summary.nutrients.find((n) => n.nutrientId === rdaItem.nutrientId);
          const current = currentNutrient ? currentNutrient.amount : 0;
          const rda = rdaItem.rda;
          const gap = rda - current;
          const percentage = Math.round((current / rda) * 100);
          const name = nutrientNames[rdaItem.nutrientId];
          const unit = nutrientUnits[rdaItem.nutrientId];
          const category = nutrientCategories[rdaItem.nutrientId] as 'vitamin' | 'mineral' | 'macronutrient';

          if (name && unit && category) {
            result.push({
              nutrientId: rdaItem.nutrientId,
              nutrientName: name,
              unit,
              rda,
              current,
              gap,
              percentage,
              category,
            });
          }
        }

        return result.sort((a, b) => a.gap - b.gap);
      },

      getWeeklyNutritionTrend: () => {
        const { getDailyNutritionSummary } = get();
        const result = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const summary = getDailyNutritionSummary(dateStr);
          result.push({
            date: dateStr,
            calories: summary.totalCalories,
            protein: summary.totalProtein,
          });
        }
        return result;
      },
    }),
    {
      name: 'nutrition-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        foodIntakeRecords: state.foodIntakeRecords,
        selectedLifeStage: state.selectedLifeStage,
      }),
    }
  )
);
