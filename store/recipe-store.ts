import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Recipe, MealPlan } from "@/types/recipe"

interface RecipeStore {
  recipes: Recipe[]
  savedRecipes: Recipe[]
  mealPlans: MealPlan[]
  isLoading: boolean

  addRecipe: (recipe: Recipe) => void
  saveRecipe: (recipe: Recipe) => void
  addMealPlan: (mealPlan: MealPlan) => void
  removeRecipe: (recipeId: string) => void
  removeMealPlan: (mealPlanId: string) => void
  setLoading: (loading: boolean) => void
  clearAll: () => void
}

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      recipes: [],
      savedRecipes: [],
      mealPlans: [],
      isLoading: false,

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      addRecipe: (recipe: Recipe) => {
        console.log("✅ Adding recipe to frontend:", recipe.title)
        set((state) => ({
          recipes: [recipe, ...state.recipes],
        }))
      },

      saveRecipe: (recipe: Recipe) => {
        const isCurrentlySaved = get().savedRecipes.some((saved) => saved.id === recipe.id)
        
        if (isCurrentlySaved) {
          console.log("❤️ Removing recipe from saved:", recipe.title)
          set((state) => ({
            savedRecipes: state.savedRecipes.filter((saved) => saved.id !== recipe.id),
          }))
        } else {
          console.log("❤️ Adding recipe to saved:", recipe.title)
          set((state) => ({
            savedRecipes: [recipe, ...state.savedRecipes],
          }))
        }
      },

      addMealPlan: (mealPlan: MealPlan) => {
        console.log("📅 Adding meal plan to frontend:", mealPlan.id)
        set((state) => ({
          mealPlans: [mealPlan, ...state.mealPlans],
        }))
      },

      removeRecipe: (recipeId: string) => {
        console.log("🗑️ Removing recipe:", recipeId)
        set((state) => ({
          recipes: state.recipes.filter((recipe) => recipe.id !== recipeId),
          savedRecipes: state.savedRecipes.filter((recipe) => recipe.id !== recipeId),
        }))
      },

      removeMealPlan: (mealPlanId: string) => {
        console.log("🗑️ Removing meal plan:", mealPlanId)
        set((state) => ({
          mealPlans: state.mealPlans.filter((plan) => plan.id !== mealPlanId),
        }))
      },

      clearAll: () => {
        console.log("🧹 Clearing all data")
        set({
          recipes: [],
          savedRecipes: [],
          mealPlans: [],
        })
      },
    }),
    {
      name: "recipe-storage", // localStorage key
      version: 1,
    }
  )
)
