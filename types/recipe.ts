export interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  cookingTime: number
  servings: number
  difficulty: "easy" | "medium" | "hard"
  tags: string[]
  createdAt: Date
  userId?: string
  imageUrl?: string // Made optional since we removed image generation
}

export interface MealPlan {
  id: string
  date: Date
  mealType: "breakfast" | "lunch" | "dinner"
  recipeId: string
  recipe: Recipe
  createdAt: Date
  userId?: string
}
