import { create } from "zustand"
import type { Recipe, MealPlan } from "@/types/recipe"
import {
  db,
  collection,
  doc,
  addDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "@/lib/firebase"

interface RecipeStore {
  recipes: Recipe[]
  savedRecipes: Recipe[]
  mealPlans: MealPlan[]
  isLoading: boolean

  addRecipe: (recipe: Recipe, userId?: string) => Promise<void>
  saveRecipe: (recipe: Recipe, userId: string) => Promise<void>
  addMealPlan: (mealPlan: MealPlan, userId: string) => Promise<void>
  fetchUserData: (userId: string) => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  savedRecipes: [],
  mealPlans: [],
  isLoading: false,

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  addRecipe: async (recipe: Recipe, userId?: string) => {
    try {
      console.log("🔥 Adding recipe to Firestore:", recipe.title)
      
      if (!userId) {
        throw new Error("User must be authenticated to add recipes")
      }

      // Prepare recipe data for Firestore
      const recipeData = {
        ...recipe,
        userId,
        createdAt: serverTimestamp(),
      }

      // Add to Firestore
      const docRef = await addDoc(collection(db, "recipes"), recipeData)
      
      // Update the recipe with the Firestore document ID
      const updatedRecipe = {
        ...recipe,
        id: docRef.id,
        userId,
      }

      // Update local state
      set((state) => ({
        recipes: [updatedRecipe, ...state.recipes],
      }))

      console.log("✅ Recipe added successfully:", recipe.title)
    } catch (error) {
      console.error("❌ Error adding recipe:", error)
      
      // Fallback to localStorage if Firestore fails
      try {
        console.log("🔄 Falling back to localStorage...")
        const existingRecipes = JSON.parse(localStorage.getItem(`recipes_${userId || "guest"}`) || "[]")
        const updatedRecipes = [recipe, ...existingRecipes]
        localStorage.setItem(`recipes_${userId || "guest"}`, JSON.stringify(updatedRecipes))

        set((state) => ({
          recipes: [recipe, ...state.recipes],
        }))

        console.log("✅ Recipe saved to localStorage:", recipe.title)
      } catch (localError) {
        console.error("❌ localStorage fallback failed:", localError)
        throw new Error("Failed to save recipe")
      }
    }
  },

  saveRecipe: async (recipe: Recipe, userId: string) => {
    try {
      console.log("🔥 Toggling saved recipe:", recipe.title)
      
      const isCurrentlySaved = get().savedRecipes.some((saved) => saved.id === recipe.id)
      const savedRecipeId = `${userId}_${recipe.id}`

      if (isCurrentlySaved) {
        // Remove from saved
        await deleteDoc(doc(db, "savedRecipes", savedRecipeId))
        
        set((state) => ({
          savedRecipes: state.savedRecipes.filter((saved) => saved.id !== recipe.id),
        }))
        
        console.log("✅ Recipe removed from saved:", recipe.title)
      } else {
        // Add to saved
        const savedRecipeData = {
          ...recipe,
          userId,
          savedAt: serverTimestamp(),
        }
        
        await setDoc(doc(db, "savedRecipes", savedRecipeId), savedRecipeData)
        
        set((state) => ({
          savedRecipes: [recipe, ...state.savedRecipes],
        }))
        
        console.log("✅ Recipe added to saved:", recipe.title)
      }
    } catch (error) {
      console.error("❌ Error saving recipe:", error)
      
      // Fallback to localStorage
      try {
        console.log("🔄 Falling back to localStorage...")
        const existingSaved = JSON.parse(localStorage.getItem(`savedRecipes_${userId}`) || "[]")
        const isCurrentlySaved = get().savedRecipes.some((saved) => saved.id === recipe.id)

        if (isCurrentlySaved) {
          const updatedSaved = existingSaved.filter((saved: Recipe) => saved.id !== recipe.id)
          localStorage.setItem(`savedRecipes_${userId}`, JSON.stringify(updatedSaved))
          set((state) => ({
            savedRecipes: state.savedRecipes.filter((saved) => saved.id !== recipe.id),
          }))
        } else {
          const updatedSaved = [recipe, ...existingSaved]
          localStorage.setItem(`savedRecipes_${userId}`, JSON.stringify(updatedSaved))
          set((state) => ({
            savedRecipes: [recipe, ...state.savedRecipes],
          }))
        }
        
        console.log("✅ Recipe saved to localStorage")
      } catch (localError) {
        console.error("❌ localStorage fallback failed:", localError)
        throw new Error("Failed to save recipe")
      }
    }
  },

  addMealPlan: async (mealPlan: MealPlan, userId: string) => {
    try {
      console.log("🔥 Adding meal plan to Firestore")
      
      // Prepare meal plan data for Firestore
      const mealPlanData = {
        ...mealPlan,
        userId,
        createdAt: serverTimestamp(),
        date: mealPlan.date, // Firestore handles Date objects
      }

      // Add to Firestore
      const docRef = await addDoc(collection(db, "mealPlans"), mealPlanData)
      
      // Update the meal plan with the Firestore document ID
      const updatedMealPlan = {
        ...mealPlan,
        id: docRef.id,
        userId,
      }

      // Update local state
      set((state) => ({
        mealPlans: [updatedMealPlan, ...state.mealPlans],
      }))

      console.log("✅ Meal plan added successfully")
    } catch (error) {
      console.error("❌ Error adding meal plan:", error)
      
      // Fallback to localStorage
      try {
        console.log("🔄 Falling back to localStorage...")
        const existingPlans = JSON.parse(localStorage.getItem(`mealPlans_${userId}`) || "[]")
        const updatedPlans = [mealPlan, ...existingPlans]
        localStorage.setItem(`mealPlans_${userId}`, JSON.stringify(updatedPlans))

        set((state) => ({
          mealPlans: [mealPlan, ...state.mealPlans],
        }))

        console.log("✅ Meal plan saved to localStorage")
      } catch (localError) {
        console.error("❌ localStorage fallback failed:", localError)
        throw new Error("Failed to save meal plan")
      }
    }
  },

  fetchUserData: async (userId: string) => {
    set({ isLoading: true })
    try {
      console.log("🔥 Loading user data from Firestore for:", userId)

      // Fetch recipes
      const recipesQuery = query(
        collection(db, "recipes"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      )
      const recipesSnapshot = await getDocs(recipesQuery)
      const recipes: Recipe[] = recipesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Recipe[]

      // Fetch saved recipes
      const savedRecipesQuery = query(
        collection(db, "savedRecipes"),
        where("userId", "==", userId),
        orderBy("savedAt", "desc")
      )
      const savedRecipesSnapshot = await getDocs(savedRecipesQuery)
      const savedRecipes: Recipe[] = savedRecipesSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: data.id || doc.id,
          title: data.title,
          description: data.description,
          ingredients: data.ingredients,
          instructions: data.instructions,
          cookingTime: data.cookingTime,
          servings: data.servings,
          difficulty: data.difficulty,
          tags: data.tags,
          createdAt: data.createdAt?.toDate() || new Date(),
          userId: data.userId,
          imageUrl: data.imageUrl,
        }
      })

      // Fetch meal plans
      const mealPlansQuery = query(
        collection(db, "mealPlans"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      )
      const mealPlansSnapshot = await getDocs(mealPlansQuery)
      const mealPlans: MealPlan[] = mealPlansSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as MealPlan[]

      set({
        recipes,
        savedRecipes,
        mealPlans,
        isLoading: false,
      })

      console.log(
        `✅ Loaded ${recipes.length} recipes, ${savedRecipes.length} saved recipes, ${mealPlans.length} meal plans from Firestore`
      )
    } catch (error) {
      console.error("❌ Error fetching user data from Firestore:", error)
      
      // Fallback to localStorage
      try {
        console.log("🔄 Falling back to localStorage...")
        const recipes = JSON.parse(localStorage.getItem(`recipes_${userId}`) || "[]")
        const savedRecipes = JSON.parse(localStorage.getItem(`savedRecipes_${userId}`) || "[]")
        const mealPlans = JSON.parse(localStorage.getItem(`mealPlans_${userId}`) || "[]").map((plan: any) => ({
          ...plan,
          date: new Date(plan.date),
          createdAt: new Date(plan.createdAt),
        }))

        set({
          recipes,
          savedRecipes,
          mealPlans,
          isLoading: false,
        })

        console.log(
          `✅ Loaded ${recipes.length} recipes, ${savedRecipes.length} saved recipes, ${mealPlans.length} meal plans from localStorage`
        )
      } catch (localError) {
        console.error("❌ localStorage fallback failed:", localError)
        set({
          recipes: [],
          savedRecipes: [],
          mealPlans: [],
          isLoading: false,
        })
      }
    }
  },
}))
