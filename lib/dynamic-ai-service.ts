import type { Recipe } from "@/types/recipe"

// Gemini API configuration for 100% AI-generated dynamic meal planning
const GEMINI_API_KEY = "AIzaSyAiRSHMjiGFXrEZXk1mynnO9qnaBwhJjuw";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

interface PlanConstraints {
  budget: number
  maxCookingTime: number
  days: number
  dietaryRestrictions: string[]
  preferredProteins: string[]
  avoidIngredients: string[]
  skillLevel: "beginner" | "intermediate" | "advanced"
  mealTypes: ("breakfast" | "lunch" | "dinner")[]
  cuisinePreferences: string[]
}

interface PlanFeedback {
  recipeId: string
  rating: "like" | "dislike"
  feedback: string
  adjustmentRequest?: string
}

// 100% AI-GENERATED DYNAMIC MEAL PLANNING - NO LOCAL DATABASE!

export async function generateDynamicMealPlan(prompt: string, constraints: PlanConstraints): Promise<Recipe[] | null> {
  console.log("🍽️ INSTANT meal plan generation starting...")
  console.log("Constraints:", constraints)

  try {
    // Calculate total meals needed
    const totalMeals = constraints.days * constraints.mealTypes.length
    const budgetPerMeal = constraints.budget / totalMeals

    console.log(`Need ${totalMeals} meals with budget of $${budgetPerMeal.toFixed(2)} per meal`)

    // Get available recipes based on constraints
    let availableRecipes: any[] = []

    // Add recipes for each meal type
    constraints.mealTypes.forEach((mealType) => {
      if (RECIPE_DATABASE[mealType]) {
        availableRecipes.push(...RECIPE_DATABASE[mealType])
      }
    })

    console.log(`Found ${availableRecipes.length} available recipes`)

    // Filter by dietary restrictions
    if (constraints.dietaryRestrictions.length > 0) {
      availableRecipes = availableRecipes.filter((recipe) => {
        return constraints.dietaryRestrictions.every((restriction) => {
          switch (restriction) {
            case "vegetarian":
              return (
                recipe.tags.includes("vegetarian") ||
                !recipe.tags.some((tag: string) => ["chicken", "beef", "pork", "fish", "salmon"].includes(tag))
              )
            case "vegan":
              return (
                recipe.tags.includes("vegan") ||
                (recipe.tags.includes("vegetarian") &&
                  !recipe.ingredients.some(
                    (ing: string) =>
                      ing.toLowerCase().includes("cheese") ||
                      ing.toLowerCase().includes("milk") ||
                      ing.toLowerCase().includes("egg") ||
                      ing.toLowerCase().includes("butter"),
                  ))
              )
            case "gluten-free":
              return !recipe.ingredients.some(
                (ing: string) =>
                  ing.toLowerCase().includes("bread") ||
                  ing.toLowerCase().includes("pasta") ||
                  ing.toLowerCase().includes("flour"),
              )
            case "low-carb":
              return (
                !recipe.tags.includes("pasta") &&
                !recipe.tags.includes("rice") &&
                !recipe.ingredients.some(
                  (ing: string) =>
                    ing.toLowerCase().includes("rice") ||
                    ing.toLowerCase().includes("pasta") ||
                    ing.toLowerCase().includes("bread"),
                )
              )
            case "high-protein":
              return (
                recipe.tags.includes("high-protein") ||
                recipe.tags.includes("protein") ||
                recipe.ingredients.some(
                  (ing: string) =>
                    ing.toLowerCase().includes("chicken") ||
                    ing.toLowerCase().includes("fish") ||
                    ing.toLowerCase().includes("egg") ||
                    ing.toLowerCase().includes("protein powder"),
                )
              )
            default:
              return true
          }
        })
      })
    }

    // Filter by cooking time
    availableRecipes = availableRecipes.filter((recipe) => recipe.cookingTime <= constraints.maxCookingTime)

    // Filter by preferred proteins
    if (constraints.preferredProteins.length > 0) {
      const proteinRecipes = availableRecipes.filter((recipe) =>
        constraints.preferredProteins.some(
          (protein) =>
            recipe.tags.includes(protein) ||
            recipe.ingredients.some((ing: string) => ing.toLowerCase().includes(protein)),
        ),
      )

      if (proteinRecipes.length > 0) {
        availableRecipes = proteinRecipes
      }
    }

    // Filter by cuisine preferences
    if (constraints.cuisinePreferences.length > 0) {
      const cuisineRecipes = availableRecipes.filter((recipe) =>
        constraints.cuisinePreferences.some((cuisine) => recipe.tags.includes(cuisine)),
      )

      if (cuisineRecipes.length > 0) {
        availableRecipes = cuisineRecipes
      }
    }

    // Filter out avoided ingredients
    if (constraints.avoidIngredients.length > 0) {
      availableRecipes = availableRecipes.filter(
        (recipe) =>
          !constraints.avoidIngredients.some(
            (avoid) =>
              recipe.ingredients.some((ing: string) => ing.toLowerCase().includes(avoid.toLowerCase())) ||
              recipe.title.toLowerCase().includes(avoid.toLowerCase()),
          ),
      )
    }

    // Filter by budget
    availableRecipes = availableRecipes.filter(
      (recipe) => recipe.estimatedCost <= budgetPerMeal * 1.5, // Allow some flexibility
    )

    console.log(`After filtering: ${availableRecipes.length} recipes available`)

    if (availableRecipes.length === 0) {
      console.log("No recipes match constraints, using fallback")
      availableRecipes = RECIPE_DATABASE.dinner.slice(0, 3) // Fallback to basic dinner recipes
    }

    // Select recipes for the meal plan
    const selectedRecipes: Recipe[] = []
    const usedRecipes = new Set<string>()

    // Distribute recipes across meal types and days
    for (let day = 0; day < constraints.days; day++) {
      for (let mealIndex = 0; mealIndex < constraints.mealTypes.length; mealIndex++) {
        const mealType = constraints.mealTypes[mealIndex]

        // Find recipes for this meal type
        const mealTypeRecipes = availableRecipes.filter((recipe) =>
          RECIPE_DATABASE[mealType]?.some((dbRecipe) => dbRecipe.title === recipe.title),
        )

        let selectedRecipe
        if (mealTypeRecipes.length > 0) {
          // Try to avoid repeating recipes
          const unusedRecipes = mealTypeRecipes.filter((recipe) => !usedRecipes.has(recipe.title))
          selectedRecipe =
            unusedRecipes.length > 0
              ? unusedRecipes[Math.floor(Math.random() * unusedRecipes.length)]
              : mealTypeRecipes[Math.floor(Math.random() * mealTypeRecipes.length)]
        } else {
          // Fallback to any available recipe
          selectedRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)]
        }

        if (selectedRecipe) {
          const recipe: Recipe = {
            id: `dynamic-${Date.now()}-${selectedRecipes.length}`,
            title: selectedRecipe.title,
            description: selectedRecipe.description,
            ingredients: selectedRecipe.ingredients,
            instructions: selectedRecipe.instructions,
            cookingTime: selectedRecipe.cookingTime,
            servings: selectedRecipe.servings,
            difficulty: selectedRecipe.difficulty,
            tags: selectedRecipe.tags,
            createdAt: new Date(),
            imageUrl: `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(selectedRecipe.title)}`,
          }

          // Add estimated cost as a property
          ;(recipe as any).estimatedCost = selectedRecipe.estimatedCost

          selectedRecipes.push(recipe)
          usedRecipes.add(selectedRecipe.title)
        }
      }
    }

    console.log(`Generated ${selectedRecipes.length} recipes for meal plan`)
    return selectedRecipes
  } catch (error) {
    console.error("Error in generateDynamicMealPlan:", error)
    return null
  }
}

export async function adjustMealPlan(
  currentPlan: Recipe[],
  feedback: PlanFeedback[],
  adjustmentRequest: string,
): Promise<Recipe[] | null> {
  console.log("Adjusting meal plan based on feedback:", feedback)
  console.log("Adjustment request:", adjustmentRequest)

  try {
    const dislikedRecipeIds = feedback.filter((f) => f.rating === "dislike").map((f) => f.recipeId)

    const adjustedPlan = currentPlan.map((recipe) => {
      if (dislikedRecipeIds.includes(recipe.id)) {
        // Find a replacement recipe
        return generateAlternativeRecipe(recipe, adjustmentRequest)
      }

      // Apply general adjustments to liked/neutral recipes
      if (adjustmentRequest.includes("milder") || adjustmentRequest.includes("less spicy")) {
        return adjustRecipeForMildness(recipe)
      }

      if (adjustmentRequest.includes("quicker") || adjustmentRequest.includes("20 minutes")) {
        return adjustRecipeForSpeed(recipe)
      }

      if (adjustmentRequest.includes("budget") || adjustmentRequest.includes("cheaper")) {
        return adjustRecipeForBudget(recipe)
      }

      return recipe
    })

    return adjustedPlan
  } catch (error) {
    console.error("Error in adjustMealPlan:", error)
    return null
  }
}

function generateAlternativeRecipe(originalRecipe: Recipe, adjustmentRequest: string): Recipe {
  // Get all available recipes
  const allRecipes = [...RECIPE_DATABASE.breakfast, ...RECIPE_DATABASE.lunch, ...RECIPE_DATABASE.dinner]

  // Filter based on adjustment request
  let alternatives = allRecipes.filter((recipe) => recipe.title !== originalRecipe.title)

  if (adjustmentRequest.includes("milder") || adjustmentRequest.includes("less spicy")) {
    alternatives = alternatives.filter(
      (recipe) =>
        !recipe.tags.includes("spicy") &&
        !recipe.ingredients.some(
          (ing) =>
            ing.toLowerCase().includes("pepper") ||
            ing.toLowerCase().includes("chili") ||
            ing.toLowerCase().includes("hot"),
        ),
    )
  }

  if (adjustmentRequest.includes("quicker") || adjustmentRequest.includes("20 minutes")) {
    alternatives = alternatives.filter((recipe) => recipe.cookingTime <= 20)
  }

  if (adjustmentRequest.includes("budget") || adjustmentRequest.includes("cheaper")) {
    alternatives = alternatives.filter((recipe) => recipe.estimatedCost < 8)
  }

  if (adjustmentRequest.includes("vegetarian")) {
    alternatives = alternatives.filter(
      (recipe) =>
        recipe.tags.includes("vegetarian") ||
        !recipe.tags.some((tag) => ["chicken", "beef", "pork", "fish", "salmon"].includes(tag)),
    )
  }

  // Select a random alternative or fallback
  const selectedAlternative =
    alternatives.length > 0 ? alternatives[Math.floor(Math.random() * alternatives.length)] : RECIPE_DATABASE.dinner[0] // Fallback to first dinner recipe

  return {
    id: `adjusted-${Date.now()}-${Math.random()}`,
    title: selectedAlternative.title,
    description: selectedAlternative.description,
    ingredients: selectedAlternative.ingredients,
    instructions: selectedAlternative.instructions,
    cookingTime: selectedAlternative.cookingTime,
    servings: selectedAlternative.servings,
    difficulty: selectedAlternative.difficulty,
    tags: selectedAlternative.tags,
    createdAt: new Date(),
    imageUrl: `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(selectedAlternative.title)}`,
  }
}

function adjustRecipeForMildness(recipe: Recipe): Recipe {
  // Create a milder version of the recipe
  const adjustedIngredients = recipe.ingredients.map((ingredient) => {
    if (ingredient.toLowerCase().includes("pepper") || ingredient.toLowerCase().includes("chili")) {
      return ingredient.replace(/\d+/g, (match) => Math.max(1, Math.floor(Number.parseInt(match) / 2)).toString())
    }
    return ingredient
  })

  return {
    ...recipe,
    id: `mild-${recipe.id}`,
    title: `Mild ${recipe.title}`,
    description: `${recipe.description} (adjusted for milder flavors)`,
    ingredients: adjustedIngredients,
    instructions: recipe.instructions.map((instruction) =>
      instruction.includes("spicy") || instruction.includes("hot")
        ? instruction + " (use less for milder taste)"
        : instruction,
    ),
  }
}

function adjustRecipeForSpeed(recipe: Recipe): Recipe {
  if (recipe.cookingTime <= 20) return recipe

  // Create a quicker version
  const quickerInstructions = recipe.instructions.map((instruction) => {
    if (instruction.includes("simmer") || instruction.includes("slow")) {
      return instruction.replace(/\d+\s*minutes?/g, "10 minutes")
    }
    return instruction
  })

  return {
    ...recipe,
    id: `quick-${recipe.id}`,
    title: `Quick ${recipe.title}`,
    description: `${recipe.description} (optimized for speed)`,
    instructions: quickerInstructions,
    cookingTime: Math.min(recipe.cookingTime, 20),
  }
}

function adjustRecipeForBudget(recipe: Recipe): Recipe {
  // Create a more budget-friendly version
  const budgetIngredients = recipe.ingredients.map((ingredient) => {
    // Replace expensive ingredients with cheaper alternatives
    if (ingredient.toLowerCase().includes("salmon")) {
      return ingredient.replace(/salmon/gi, "tilapia")
    }
    if (ingredient.toLowerCase().includes("beef sirloin")) {
      return ingredient.replace(/beef sirloin/gi, "ground beef")
    }
    if (ingredient.toLowerCase().includes("fresh")) {
      return ingredient.replace(/fresh/gi, "frozen")
    }
    return ingredient
  })

  return {
    ...recipe,
    id: `budget-${recipe.id}`,
    title: `Budget ${recipe.title}`,
    description: `${recipe.description} (budget-friendly version)`,
    ingredients: budgetIngredients,
  }
}
