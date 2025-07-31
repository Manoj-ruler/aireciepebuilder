import type { Recipe } from "@/types/recipe"

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

// Comprehensive recipe database organized by categories
const RECIPE_DATABASE = {
  breakfast: [
    {
      title: "Quick Scrambled Eggs",
      description: "Fluffy scrambled eggs with herbs",
      ingredients: [
        "3 eggs ($1.50)",
        "2 tbsp milk ($0.25)",
        "Salt & pepper ($0.10)",
        "Fresh chives ($0.50)",
        "Butter ($0.25)",
      ],
      instructions: [
        "Beat eggs with milk in a bowl",
        "Heat butter in non-stick pan over medium-low heat",
        "Pour in eggs and let sit for 20 seconds",
        "Gently stir with spatula, creating large curds",
        "Remove from heat while slightly wet, garnish with chives",
      ],
      cookingTime: 8,
      servings: 2,
      difficulty: "easy" as const,
      tags: ["breakfast", "quick", "protein", "vegetarian"],
      estimatedCost: 2.6,
    },
    {
      title: "Overnight Oats",
      description: "No-cook breakfast with berries and nuts",
      ingredients: [
        "1/2 cup rolled oats ($0.50)",
        "1/2 cup milk ($0.75)",
        "1 tbsp honey ($0.50)",
        "Mixed berries ($2.00)",
        "Chia seeds ($0.75)",
      ],
      instructions: [
        "Mix oats, milk, honey, and chia seeds in jar",
        "Refrigerate overnight",
        "Top with fresh berries before serving",
        "Add extra milk if too thick",
      ],
      cookingTime: 5,
      servings: 1,
      difficulty: "easy" as const,
      tags: ["breakfast", "healthy", "no-cook", "make-ahead"],
      estimatedCost: 4.5,
    },
    {
      title: "Avocado Toast Supreme",
      description: "Creamy avocado on sourdough with toppings",
      ingredients: [
        "2 slices sourdough ($1.50)",
        "1 ripe avocado ($1.50)",
        "1 egg ($0.50)",
        "Lemon juice ($0.25)",
        "Red pepper flakes ($0.10)",
        "Sea salt ($0.05)",
      ],
      instructions: [
        "Toast bread until golden brown",
        "Mash avocado with lemon juice and salt",
        "Fry egg sunny-side up",
        "Spread avocado on toast",
        "Top with fried egg and red pepper flakes",
      ],
      cookingTime: 10,
      servings: 2,
      difficulty: "easy" as const,
      tags: ["breakfast", "healthy", "vegetarian", "trendy"],
      estimatedCost: 3.9,
    },
    {
      title: "Protein Smoothie Bowl",
      description: "Thick smoothie bowl with toppings",
      ingredients: [
        "1 frozen banana ($0.75)",
        "1/2 cup berries ($2.00)",
        "1 scoop protein powder ($2.00)",
        "1/4 cup milk ($0.50)",
        "Granola ($1.00)",
        "Coconut flakes ($0.75)",
      ],
      instructions: [
        "Blend frozen banana, berries, protein powder, and milk until thick",
        "Pour into bowl",
        "Top with granola and coconut flakes",
        "Add extra toppings as desired",
      ],
      cookingTime: 5,
      servings: 1,
      difficulty: "easy" as const,
      tags: ["breakfast", "healthy", "high-protein", "smoothie"],
      estimatedCost: 7.0,
    },
  ],
  lunch: [
    {
      title: "Mediterranean Quinoa Bowl",
      description: "Fresh quinoa salad with Mediterranean flavors",
      ingredients: [
        "1 cup quinoa ($2.00)",
        "1 cucumber ($1.00)",
        "2 tomatoes ($1.50)",
        "1/2 red onion ($0.50)",
        "Feta cheese ($2.00)",
        "Olives ($1.50)",
        "Olive oil ($0.50)",
        "Lemon ($0.50)",
      ],
      instructions: [
        "Cook quinoa according to package directions, let cool",
        "Dice cucumber, tomatoes, and red onion",
        "Crumble feta cheese",
        "Make dressing with olive oil and lemon juice",
        "Combine all ingredients and toss with dressing",
      ],
      cookingTime: 20,
      servings: 3,
      difficulty: "easy" as const,
      tags: ["lunch", "healthy", "vegetarian", "mediterranean", "meal-prep"],
      estimatedCost: 9.5,
    },
    {
      title: "Chicken Caesar Wrap",
      description: "Classic Caesar salad in a wrap",
      ingredients: [
        "2 large tortillas ($1.00)",
        "2 chicken breasts ($4.00)",
        "Romaine lettuce ($1.50)",
        "Caesar dressing ($1.00)",
        "Parmesan cheese ($1.50)",
      ],
      instructions: [
        "Grill chicken breasts and slice",
        "Warm tortillas",
        "Add lettuce, chicken, and dressing to tortillas",
        "Sprinkle with Parmesan cheese",
        "Roll tightly and cut in half",
      ],
      cookingTime: 15,
      servings: 2,
      difficulty: "easy" as const,
      tags: ["lunch", "chicken", "wrap", "protein"],
      estimatedCost: 9.0,
    },
    {
      title: "Lentil Soup",
      description: "Hearty and nutritious lentil soup",
      ingredients: [
        "1 cup red lentils ($1.50)",
        "1 onion ($0.50)",
        "2 carrots ($0.75)",
        "2 celery stalks ($1.00)",
        "Vegetable broth ($2.00)",
        "Spices ($0.50)",
      ],
      instructions: [
        "Sauté diced onion, carrots, and celery",
        "Add lentils and broth",
        "Season with cumin, paprika, and bay leaves",
        "Simmer for 25 minutes until lentils are tender",
        "Adjust seasoning and serve hot",
      ],
      cookingTime: 35,
      servings: 4,
      difficulty: "easy" as const,
      tags: ["lunch", "vegetarian", "high-protein", "soup", "budget-friendly"],
      estimatedCost: 6.25,
    },
  ],
  dinner: [
    {
      title: "One-Pot Chicken and Rice",
      description: "Complete meal cooked in one pot",
      ingredients: [
        "4 chicken thighs ($4.00)",
        "1.5 cups rice ($1.00)",
        "1 onion ($0.50)",
        "2 carrots ($0.75)",
        "Chicken broth ($2.00)",
        "Garlic & herbs ($0.75)",
      ],
      instructions: [
        "Brown chicken thighs in large pot, remove",
        "Sauté onion and carrots in same pot",
        "Add rice, broth, and seasonings",
        "Return chicken to pot",
        "Simmer covered for 25 minutes until rice is tender",
      ],
      cookingTime: 35,
      servings: 4,
      difficulty: "easy" as const,
      tags: ["dinner", "one-pot", "chicken", "complete-meal", "budget-friendly"],
      estimatedCost: 9.0,
    },
    {
      title: "Honey Garlic Salmon",
      description: "Pan-seared salmon with sweet glaze",
      ingredients: [
        "4 salmon fillets ($12.00)",
        "3 tbsp honey ($1.00)",
        "4 cloves garlic ($0.50)",
        "2 tbsp soy sauce ($0.25)",
        "1 tbsp olive oil ($0.25)",
        "Green onions ($0.75)",
      ],
      instructions: [
        "Mix honey, minced garlic, and soy sauce for glaze",
        "Heat olive oil in large skillet",
        "Sear salmon skin-side up for 4 minutes",
        "Flip salmon and cook 3 more minutes",
        "Add glaze and cook until caramelized, garnish with green onions",
      ],
      cookingTime: 15,
      servings: 4,
      difficulty: "easy" as const,
      tags: ["dinner", "fish", "healthy", "quick", "gluten-free"],
      estimatedCost: 14.75,
    },
    {
      title: "Vegetarian Chili",
      description: "Hearty bean chili with vegetables",
      ingredients: [
        "2 cans black beans ($2.00)",
        "1 can diced tomatoes ($1.00)",
        "1 bell pepper ($1.50)",
        "1 onion ($0.50)",
        "Chili spices ($1.00)",
        "Vegetable broth ($1.50)",
      ],
      instructions: [
        "Sauté diced onion and bell pepper",
        "Add beans, tomatoes, and spices",
        "Pour in broth and bring to boil",
        "Simmer for 30 minutes, stirring occasionally",
        "Adjust seasoning and serve with toppings",
      ],
      cookingTime: 40,
      servings: 6,
      difficulty: "easy" as const,
      tags: ["dinner", "vegetarian", "high-protein", "budget-friendly", "meal-prep"],
      estimatedCost: 7.5,
    },
    {
      title: "Beef Stir Fry",
      description: "Quick beef and vegetable stir fry",
      ingredients: [
        "1 lb beef sirloin ($8.00)",
        "Mixed vegetables ($3.00)",
        "Soy sauce ($0.50)",
        "Garlic & ginger ($0.75)",
        "Rice ($1.00)",
        "Oil ($0.25)",
      ],
      instructions: [
        "Slice beef thinly against the grain",
        "Heat oil in wok or large skillet",
        "Stir-fry beef until browned, remove",
        "Stir-fry vegetables until tender-crisp",
        "Return beef, add sauce, serve over rice",
      ],
      cookingTime: 18,
      servings: 4,
      difficulty: "easy" as const,
      tags: ["dinner", "beef", "quick", "asian", "stir-fry"],
      estimatedCost: 13.5,
    },
    {
      title: "Pasta Primavera",
      description: "Fresh pasta with seasonal vegetables",
      ingredients: [
        "1 lb pasta ($2.00)",
        "Mixed seasonal vegetables ($4.00)",
        "Olive oil ($0.50)",
        "Garlic ($0.25)",
        "Parmesan cheese ($2.00)",
        "Fresh herbs ($1.00)",
      ],
      instructions: [
        "Cook pasta according to package directions",
        "Sauté vegetables in olive oil with garlic",
        "Toss hot pasta with vegetables",
        "Add fresh herbs and Parmesan cheese",
        "Season with salt and pepper",
      ],
      cookingTime: 20,
      servings: 4,
      difficulty: "easy" as const,
      tags: ["dinner", "vegetarian", "pasta", "fresh", "italian"],
      estimatedCost: 9.75,
    },
  ],
}

export async function generateDynamicMealPlan(prompt: string, constraints: PlanConstraints): Promise<Recipe[] | null> {
  console.log("Generating dynamic meal plan with constraints:", constraints)
  console.log("Prompt:", prompt)

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
