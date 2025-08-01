import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Recipe, MealPlan } from "@/types/recipe"

interface RecipeStore {
  recipes: Recipe[]
  savedRecipes: Recipe[]
  mealPlans: MealPlan[]
  isLoading: boolean
  currentUserEmail: string | null

  addRecipe: (recipe: Recipe) => void
  saveRecipe: (recipe: Recipe) => void
  addMealPlan: (mealPlan: MealPlan) => void
  removeRecipe: (recipeId: string) => void
  removeMealPlan: (mealPlanId: string) => void
  setLoading: (loading: boolean) => void
  clearAll: () => void
  setCurrentUser: (email: string | null) => void
  loadUserData: (email: string) => void
  saveUserData: (email: string) => void
}

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      recipes: [],
      savedRecipes: [],
      mealPlans: [],
      isLoading: false,
      currentUserEmail: null,

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      addRecipe: (recipe: Recipe) => {
        console.log("✅ Adding recipe to frontend:", recipe.title)
        set((state) => ({
          recipes: [recipe, ...state.recipes],
        }))
        // Auto-save user data after adding recipe
        const currentEmail = get().currentUserEmail
        if (currentEmail) {
          get().saveUserData(currentEmail)
        }
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
        // Auto-save user data after saving/unsaving recipe
        const currentEmail = get().currentUserEmail
        if (currentEmail) {
          get().saveUserData(currentEmail)
        }
      },

      addMealPlan: (mealPlan: MealPlan) => {
        console.log("📅 Adding meal plan to frontend:", mealPlan.id)
        set((state) => ({
          mealPlans: [mealPlan, ...state.mealPlans],
        }))
        // Auto-save user data after adding meal plan
        const currentEmail = get().currentUserEmail
        if (currentEmail) {
          get().saveUserData(currentEmail)
        }
      },

      removeRecipe: (recipeId: string) => {
        console.log("🗑️ Removing recipe:", recipeId)
        set((state) => ({
          recipes: state.recipes.filter((recipe) => recipe.id !== recipeId),
          savedRecipes: state.savedRecipes.filter((recipe) => recipe.id !== recipeId),
        }))
        // Auto-save user data after removing recipe
        const currentEmail = get().currentUserEmail
        if (currentEmail) {
          get().saveUserData(currentEmail)
        }
      },

      removeMealPlan: (mealPlanId: string) => {
        console.log("🗑️ Removing meal plan:", mealPlanId)
        set((state) => ({
          mealPlans: state.mealPlans.filter((plan) => plan.id !== mealPlanId),
        }))
        // Auto-save user data after removing meal plan
        const currentEmail = get().currentUserEmail
        if (currentEmail) {
          get().saveUserData(currentEmail)
        }
      },

      clearAll: () => {
        console.log("🧹 Clearing all data")
        set({
          recipes: [],
          savedRecipes: [],
          mealPlans: [],
        })
      },

      setCurrentUser: (email: string | null) => {
        console.log("👤 Setting current user:", email)
        set({ currentUserEmail: email })
      },

      loadUserData: (email: string) => {
        try {
          console.log("📂 Loading user data for:", email)
          const userKey = `recipe-storage-${email}`
          const userData = localStorage.getItem(userKey)
          
          if (userData) {
            const parsedData = JSON.parse(userData)
            console.log("✅ Found existing data for user:", email, parsedData)
            set({
              recipes: parsedData.recipes || [],
              savedRecipes: parsedData.savedRecipes || [],
              mealPlans: parsedData.mealPlans || [],
              currentUserEmail: email,
            })
          } else {
            console.log("🆕 No existing data found for user:", email)
            set({
              recipes: [],
              savedRecipes: [],
              mealPlans: [],
              currentUserEmail: email,
            })
          }
        } catch (error) {
          console.error("❌ Error loading user data:", error)
          set({
            recipes: [],
            savedRecipes: [],
            mealPlans: [],
            currentUserEmail: email,
          })
        }
      },

      saveUserData: (email: string) => {
        try {
          const state = get()
          const userKey = `recipe-storage-${email}`
          const userData = {
            recipes: state.recipes,
            savedRecipes: state.savedRecipes,
            mealPlans: state.mealPlans,
            lastUpdated: new Date().toISOString(),
          }
          
          localStorage.setItem(userKey, JSON.stringify(userData))
          console.log("💾 Saved user data for:", email, userData)
        } catch (error) {
          console.error("❌ Error saving user data:", error)
        }
      },
    }),
    {
      name: "recipe-storage", // localStorage key
      version: 1,
    }
  )
)
