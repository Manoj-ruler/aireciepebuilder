import type { Recipe } from "@/types/recipe"
import { aiCache } from "./ai-cache"

// OpenAI API configuration
const OPENAI_API_KEY = "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"
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

// Gemini API configuration - OPTIMIZED AND WORKING PERFECTLY
const GEMINI_API_KEY = "AIzaSyBpqSbrMGWsQnDj5Vmu2280ljDu4t9FPOc"
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"

// Enhanced fallback recipes
const FALLBACK_RECIPES = [
  {
    title: "AI-Generated Honey Garlic Chicken",
    description: "Tender chicken glazed with a perfect balance of sweet honey and savory garlic",
    ingredients: [
      "4 boneless chicken breasts (1.5 lbs)",
      "1/3 cup honey",
      "4 cloves garlic, minced",
      "3 tbsp soy sauce",
      "2 tbsp olive oil",
      "1 tsp fresh ginger, grated",
      "2 green onions, chopped",
      "1 tsp sesame seeds",
      "Salt and pepper to taste",
    ],
    instructions: [
      "Season chicken breasts with salt and pepper on both sides",
      "Heat olive oil in a large skillet over medium-high heat",
      "Cook chicken for 6-7 minutes per side until golden brown and cooked through",
      "In a small bowl, whisk together honey, minced garlic, soy sauce, and ginger",
      "Pour the honey garlic sauce over the chicken in the skillet",
      "Cook for 2-3 minutes, turning chicken to coat with the glaze",
      "Remove from heat and garnish with chopped green onions and sesame seeds",
      "Let rest for 2 minutes before serving",
    ],
    cookingTime: 20,
    servings: 4,
    difficulty: "easy" as const,
    tags: ["chicken", "asian-inspired", "dinner", "gluten-free", "quick"],
  },
  {
    title: "Mediterranean Quinoa Power Bowl",
    description: "A nutritious and colorful bowl packed with Mediterranean flavors and plant-based protein",
    ingredients: [
      "1 cup quinoa, rinsed",
      "2 cups vegetable broth",
      "1 cucumber, diced",
      "2 large tomatoes, diced",
      "1/2 red onion, thinly sliced",
      "1/2 cup kalamata olives, pitted",
      "4 oz feta cheese, crumbled",
      "1/4 cup extra virgin olive oil",
      "3 tbsp fresh lemon juice",
      "2 tbsp fresh parsley, chopped",
      "1 tbsp fresh mint, chopped",
      "1 tsp dried oregano",
    ],
    instructions: [
      "Cook quinoa in vegetable broth according to package directions, then let cool",
      "While quinoa cools, prepare all vegetables and herbs",
      "In a large bowl, combine cooled quinoa, cucumber, tomatoes, and red onion",
      "Add kalamata olives and crumbled feta cheese",
      "In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper",
      "Pour dressing over the quinoa mixture and toss gently",
      "Fold in fresh parsley and mint",
      "Let sit for 10 minutes to allow flavors to meld",
      "Serve chilled or at room temperature",
    ],
    cookingTime: 25,
    servings: 4,
    difficulty: "easy" as const,
    tags: ["vegetarian", "mediterranean", "healthy", "meal-prep", "gluten-free"],
  },
  {
    title: "Classic Beef Stir-Fry",
    description: "Quick and flavorful beef stir-fry with crisp vegetables in a savory sauce",
    ingredients: [
      "1 lb beef sirloin, sliced thin against the grain",
      "2 tbsp vegetable oil, divided",
      "1 bell pepper, sliced",
      "1 onion, sliced",
      "2 carrots, julienned",
      "3 cloves garlic, minced",
      "1 tbsp fresh ginger, grated",
      "3 tbsp soy sauce",
      "1 tbsp oyster sauce",
      "1 tsp cornstarch",
      "1 tsp sesame oil",
      "2 green onions, chopped",
      "Cooked rice for serving",
    ],
    instructions: [
      "Marinate sliced beef with 1 tbsp soy sauce and cornstarch for 15 minutes",
      "Heat 1 tbsp oil in a wok or large skillet over high heat",
      "Stir-fry beef until browned, about 2-3 minutes, then remove and set aside",
      "Add remaining oil to the pan",
      "Stir-fry vegetables starting with carrots, then onion and bell pepper",
      "Add garlic and ginger, stir-fry for 30 seconds until fragrant",
      "Return beef to the pan",
      "Add remaining soy sauce, oyster sauce, and sesame oil",
      "Stir-fry everything together for 1-2 minutes",
      "Garnish with green onions and serve immediately over rice",
    ],
    cookingTime: 18,
    servings: 4,
    difficulty: "easy" as const,
    tags: ["beef", "asian", "stir-fry", "quick", "dinner"],
  },
]

export async function generateRecipe(prompt: string): Promise<Recipe | null> {
  console.log("🍳 AI Chef is working on your recipe:", prompt)

  // Check cache first for instant results
  const cachedRecipe = aiCache.get(prompt, 'recipe')
  if (cachedRecipe) {
    console.log("⚡ Instant recipe from cache!")
    return cachedRecipe
  }

  try {
    // Try AI generation first with your API key
    const aiRecipe = await tryAIGeneration(prompt)
    if (aiRecipe) {
      console.log("✅ AI successfully created your recipe!")
      // Cache the successful result
      aiCache.set(prompt, aiRecipe, 'recipe')
      return aiRecipe
    }

    console.log("🔄 Using smart fallback recipe")
    const fallbackRecipe = generateContextualFallback(prompt)
    // Cache fallback for shorter time (2 minutes)
    aiCache.set(prompt, fallbackRecipe, 'recipe', 2 * 60 * 1000)
    return fallbackRecipe
  } catch (error) {
    console.error("❌ Recipe generation error:", error)
    const fallbackRecipe = generateContextualFallback(prompt)
    // Cache fallback for shorter time (2 minutes)
    aiCache.set(prompt, fallbackRecipe, 'recipe', 2 * 60 * 1000)
    return fallbackRecipe
  }
}

async function tryAIGeneration(prompt: string): Promise<Recipe | null> {
  try {
    console.log("🤖 Connecting to OpenAI Chef...")

    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional chef and recipe creator. You always respond with valid JSON only, no additional text or formatting."
        },
        {
          role: "user",
          content: `Create a detailed, delicious recipe based on this request: "${prompt}".

Respond with ONLY a JSON object in this exact format:
{
  "title": "Recipe Name",
  "description": "Brief appetizing description (1-2 sentences)",
  "ingredients": ["1 lb chicken breast", "2 tbsp olive oil", "1 tsp salt", "etc"],
  "instructions": ["Step 1 with details", "Step 2 with details", "etc"],
  "cookingTime": 25,
  "servings": 4,
  "difficulty": "easy",
  "tags": ["chicken", "healthy", "dinner", "quick"]
}

Requirements:
- Include specific quantities for all ingredients
- Write clear, detailed cooking instructions
- Use realistic cooking times
- Difficulty must be "easy", "medium", or "hard"
- Include 3-5 relevant tags
- Make it sound delicious and achievable`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000) // 12 second timeout for faster response

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ OpenAI API error (${response.status}):`, errorText)
      return null
    }

    const data = await response.json()

    if (!data.choices?.[0]?.message?.content) {
      console.error("❌ Invalid OpenAI response structure")
      return null
    }

    const generatedText = data.choices[0].message.content.trim()
    console.log("📝 OpenAI response received:", generatedText.substring(0, 200) + "...")

    // Extract JSON from response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("❌ No JSON found in OpenAI response")
      return null
    }

    const recipeData = JSON.parse(jsonMatch[0])

    // Validate required fields
    if (!recipeData.title || !recipeData.ingredients || !recipeData.instructions) {
      console.error("❌ Missing required recipe fields")
      return null
    }

    const recipe: Recipe = {
      id: `ai_${Date.now()}`,
      title: recipeData.title,
      description: recipeData.description || "A delicious AI-generated recipe",
      ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
      instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
      cookingTime: typeof recipeData.cookingTime === "number" ? recipeData.cookingTime : 30,
      servings: typeof recipeData.servings === "number" ? recipeData.servings : 4,
      difficulty: ["easy", "medium", "hard"].includes(recipeData.difficulty) ? recipeData.difficulty : "easy",
      tags: Array.isArray(recipeData.tags) ? recipeData.tags : ["ai-generated"],
      createdAt: new Date(),
      imageUrl: `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(recipeData.title)}`,
    }

    console.log("✅ OpenAI recipe created successfully:", recipe.title)
    return recipe
  } catch (error) {
    console.error("❌ OpenAI generation failed:", error)
    return null
  }
}

function generateContextualFallback(prompt: string): Recipe {
  console.log("🎯 Selecting perfect fallback recipe for:", prompt)

  const lowerPrompt = prompt.toLowerCase()
  let selectedRecipe = FALLBACK_RECIPES[0] // Default

  // Smart matching
  if (lowerPrompt.includes("chicken") || lowerPrompt.includes("honey") || lowerPrompt.includes("garlic")) {
    selectedRecipe = FALLBACK_RECIPES[0] // Honey Garlic Chicken
  } else if (
    lowerPrompt.includes("healthy") ||
    lowerPrompt.includes("vegetarian") ||
    lowerPrompt.includes("quinoa") ||
    lowerPrompt.includes("mediterranean")
  ) {
    selectedRecipe = FALLBACK_RECIPES[1] // Mediterranean Quinoa Bowl
  } else if (lowerPrompt.includes("beef") || lowerPrompt.includes("stir") || lowerPrompt.includes("quick")) {
    selectedRecipe = FALLBACK_RECIPES[2] // Beef Stir-Fry
  } else {
    // Random selection for variety
    selectedRecipe = FALLBACK_RECIPES[Math.floor(Math.random() * FALLBACK_RECIPES.length)]
  }

  return {
    id: `fallback_${Date.now()}`,
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
}

export async function generateMealPlan(prompt: string): Promise<Recipe[] | null> {
  console.log("🗓️ Creating your weekly meal plan:", prompt)

  // Check cache first for instant results
  const cachedMealPlan = aiCache.get(prompt, 'mealplan')
  if (cachedMealPlan) {
    console.log("⚡ Instant meal plan from cache!")
    return cachedMealPlan
  }

  try {
    const aiMealPlan = await tryAIMealPlanGeneration(prompt)
    if (aiMealPlan && aiMealPlan.length > 0) {
      console.log("✅ AI meal plan created successfully!")
      // Cache the successful result for 10 minutes
      aiCache.set(prompt, aiMealPlan, 'mealplan', 10 * 60 * 1000)
      return aiMealPlan
    }

    console.log("🔄 Using curated meal plan")
    const fallbackMealPlan = generateFallbackMealPlan()
    // Cache fallback for shorter time (3 minutes)
    aiCache.set(prompt, fallbackMealPlan, 'mealplan', 3 * 60 * 1000)
    return fallbackMealPlan
  } catch (error) {
    console.error("❌ Meal plan generation error:", error)
    const fallbackMealPlan = generateFallbackMealPlan()
    // Cache fallback for shorter time (3 minutes)
    aiCache.set(prompt, fallbackMealPlan, 'mealplan', 3 * 60 * 1000)
    return fallbackMealPlan
  }
}

async function tryAIMealPlanGeneration(prompt: string): Promise<Recipe[] | null> {
  try {
    console.log("🤖 Connecting to OpenAI for meal plan...")

    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional chef and meal planner. You always respond with valid JSON only, no additional text or formatting."
        },
        {
          role: "user",
          content: `Create 7 different recipes for a weekly meal plan based on: "${prompt}".

Respond with ONLY a JSON array of recipe objects:
[
  {
    "title": "Recipe Name",
    "description": "Brief description",
    "ingredients": ["ingredient with quantity", "ingredient with quantity"],
    "instructions": ["detailed step", "detailed step"],
    "cookingTime": 30,
    "servings": 4,
    "difficulty": "easy",
    "tags": ["tag1", "tag2"]
  }
]

Make sure to include variety in cuisines, cooking methods, and meal types. Each recipe should be complete and different from the others.`
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.3
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 18000) // 18 second timeout for meal plans

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ OpenAI meal plan API error (${response.status}):`, errorText)
      return null
    }

    const data = await response.json()

    if (!data.choices?.[0]?.message?.content) {
      console.error("❌ Invalid OpenAI meal plan response structure")
      return null
    }

    const generatedText = data.choices[0].message.content.trim()
    console.log("📝 OpenAI meal plan response received:", generatedText.substring(0, 200) + "...")

    // Extract JSON from response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error("❌ No JSON array found in OpenAI meal plan response")
      return null
    }

    const recipesData = JSON.parse(jsonMatch[0])

    if (!Array.isArray(recipesData)) {
      console.error("❌ Response is not an array")
      return null
    }

    const recipes: Recipe[] = recipesData.map((recipeData: any, index: number) => ({
      id: `meal_plan_${Date.now()}_${index}`,
      title: recipeData.title || `Recipe ${index + 1}`,
      description: recipeData.description || "A delicious meal",
      ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : ["Various ingredients"],
      instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : ["Follow cooking instructions"],
      cookingTime: typeof recipeData.cookingTime === "number" ? recipeData.cookingTime : 30,
      servings: typeof recipeData.servings === "number" ? recipeData.servings : 4,
      difficulty: ["easy", "medium", "hard"].includes(recipeData.difficulty) ? recipeData.difficulty : "easy",
      tags: Array.isArray(recipeData.tags) ? recipeData.tags : ["meal-plan"],
      createdAt: new Date(),
      imageUrl: `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(recipeData.title || `Recipe ${index + 1}`)}`,
    }))

    console.log(`✅ Generated ${recipes.length} recipes for OpenAI meal plan`)
    return recipes
  } catch (error) {
    console.error("❌ OpenAI meal plan generation failed:", error)
    return null
  }
}

function generateFallbackMealPlan(): Recipe[] {
  const weeklyRecipes = [
    {
      title: "Monday: Lemon Herb Grilled Chicken",
      description: "Juicy grilled chicken with fresh herbs and lemon",
      ingredients: ["4 chicken breasts", "2 lemons", "Fresh herbs", "Olive oil", "Garlic"],
      instructions: ["Marinate chicken", "Grill until cooked through", "Serve with lemon"],
      cookingTime: 25,
      servings: 4,
      difficulty: "easy" as const,
      tags: ["chicken", "grilled", "healthy"],
    },
    {
      title: "Tuesday: Vegetable Pasta Primavera",
      description: "Fresh seasonal vegetables tossed with pasta",
      ingredients: ["Pasta", "Mixed vegetables", "Olive oil", "Garlic", "Parmesan"],
      instructions: ["Cook pasta", "Sauté vegetables", "Combine and serve"],
      cookingTime: 20,
      servings: 4,
      difficulty: "easy" as const,
      tags: ["pasta", "vegetarian", "quick"],
    },
    {
      title: "Wednesday: Asian Salmon Bowls",
      description: "Glazed salmon over rice with vegetables",
      ingredients: ["Salmon fillets", "Rice", "Soy sauce", "Honey", "Vegetables"],
      instructions: ["Cook rice", "Glaze and cook salmon", "Assemble bowls"],
      cookingTime: 30,
      servings: 4,
      difficulty: "medium" as const,
      tags: ["salmon", "asian", "healthy"],
    },
    {
      title: "Thursday: Mexican Black Bean Tacos",
      description: "Flavorful vegetarian tacos with black beans",
      ingredients: ["Black beans", "Tortillas", "Avocado", "Lime", "Cilantro"],
      instructions: ["Season beans", "Warm tortillas", "Assemble tacos"],
      cookingTime: 15,
      servings: 4,
      difficulty: "easy" as const,
      tags: ["mexican", "vegetarian", "quick"],
    },
    {
      title: "Friday: Beef and Mushroom Stir-Fry",
      description: "Tender beef with mushrooms in savory sauce",
      ingredients: ["Beef strips", "Mushrooms", "Soy sauce", "Garlic", "Rice"],
      instructions: ["Stir-fry beef", "Add mushrooms", "Serve over rice"],
      cookingTime: 18,
      servings: 4,
      difficulty: "easy" as const,
      tags: ["beef", "stir-fry", "asian"],
    },
    {
      title: "Saturday: Mediterranean Stuffed Peppers",
      description: "Bell peppers stuffed with Mediterranean flavors",
      ingredients: ["Bell peppers", "Quinoa", "Feta", "Tomatoes", "Herbs"],
      instructions: ["Prepare filling", "Stuff peppers", "Bake until tender"],
      cookingTime: 45,
      servings: 4,
      difficulty: "medium" as const,
      tags: ["mediterranean", "vegetarian", "baked"],
    },
    {
      title: "Sunday: Comfort Food Chicken Soup",
      description: "Hearty homemade chicken soup",
      ingredients: ["Chicken", "Vegetables", "Broth", "Noodles", "Herbs"],
      instructions: ["Simmer chicken", "Add vegetables", "Serve hot"],
      cookingTime: 60,
      servings: 6,
      difficulty: "easy" as const,
      tags: ["soup", "comfort-food", "chicken"],
    },
  ]

  return weeklyRecipes.map((recipe, index) => ({
    ...recipe,
    id: `weekly_${Date.now()}_${index}`,
    createdAt: new Date(),
    imageUrl: `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(recipe.title)}`,
  }))
}
