import type { Recipe } from "@/types/recipe";
import { aiCache } from "./ai-cache";
// Removed image generation import to save API quota

// Gemini API configuration - PRIMARY AI SERVICE
const GEMINI_API_KEY = "AIzaSyBP5Vd4HsD0s2ds3ZYQpSBtq5N9fgGq2rE";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

// 100% AI-GENERATED RECIPES - NO FALLBACKS!

// Retry configuration for handling API overload
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isLastAttempt = attempt === maxRetries;
      const isRetryableError =
        error?.status === 503 || error?.status === 429 || error?.status === 500;

      if (isLastAttempt || !isRetryableError) {
        console.error(
          `❌ Final attempt failed (${attempt + 1}/${maxRetries + 1}):`,
          error
        );
        throw error;
      }

      const delay = BASE_DELAY * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(
        `⏳ API overloaded, retrying in ${Math.round(delay)}ms (attempt ${
          attempt + 1
        }/${maxRetries + 1})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return null;
}

export async function generateRecipe(prompt: string): Promise<Recipe | null> {
  console.log("🍳 100% AI-Generated Recipe Starting:", prompt);

  // Check cache first for instant results
  const cachedRecipe = aiCache.get(prompt, "recipe");
  if (cachedRecipe) {
    console.log("⚡ Instant AI recipe from cache!");
    return cachedRecipe;
  }

  try {
    // ONLY AI GENERATION - NO FALLBACKS!
    console.log("🤖 Generating recipe with Gemini AI (no fallbacks)...");

    const aiRecipe = await tryAIGeneration(prompt);

    if (aiRecipe) {
      console.log("✅ AI successfully created your recipe!");
      // Cache the successful result
      aiCache.set(prompt, aiRecipe, "recipe");
      return aiRecipe;
    }

    console.error("❌ AI generation failed - no fallback available");
    return null;
  } catch (error) {
    console.error("❌ Recipe generation error:", error);
    return null;
  }
}

async function tryAIGeneration(prompt: string): Promise<Recipe | null> {
  console.log("🚀 STARTING GEMINI AI GENERATION!");
  console.log("📝 Prompt:", prompt);
  console.log("🔑 Gemini API Key:", GEMINI_API_KEY.substring(0, 20) + "...");
  console.log("🌐 Gemini API URL:", GEMINI_API_URL);

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `You are a professional chef and recipe creator. Create a detailed, delicious recipe based on this request: "${prompt}".

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
- Make it sound delicious and achievable
- Respond with ONLY the JSON object, no additional text`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1000,
    },
  };

  // Use retry mechanism for API calls
  const result = await retryWithBackoff(async () => {
    console.log("📤 Sending request to Gemini...");

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📥 Gemini Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ GEMINI API ERROR (${response.status}):`, errorText);

      // Throw error with status for retry logic
      const error = new Error(`API Error: ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }

    return response;
  });

  if (!result) {
    console.error("❌ All retry attempts failed");
    return null;
  }

  try {
    const data = await result.json();
    console.log("📊 Full Gemini response:", JSON.stringify(data, null, 2));

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("❌ Invalid Gemini response structure");
      return null;
    }

    const generatedText = data.candidates[0].content.parts[0].text.trim();
    console.log("📝 Gemini generated text:", generatedText);

    // Extract JSON from response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ No JSON found in Gemini response");
      return null;
    }

    const recipeData = JSON.parse(jsonMatch[0]);
    console.log("🍳 Parsed recipe data:", recipeData);

    // Validate required fields
    if (
      !recipeData.title ||
      !recipeData.ingredients ||
      !recipeData.instructions
    ) {
      console.error("❌ Missing required recipe fields");
      return null;
    }

    // No image generation - removed to save API quota
    console.log("⚡ No image generation - removed to save API quota");

    const recipe: Recipe = {
      id: `gemini_${Date.now()}`,
      title: recipeData.title,
      description: recipeData.description || "A delicious AI-generated recipe",
      ingredients: Array.isArray(recipeData.ingredients)
        ? recipeData.ingredients
        : [],
      instructions: Array.isArray(recipeData.instructions)
        ? recipeData.instructions
        : [],
      cookingTime:
        typeof recipeData.cookingTime === "number"
          ? recipeData.cookingTime
          : 30,
      servings:
        typeof recipeData.servings === "number" ? recipeData.servings : 4,
      difficulty: ["easy", "medium", "hard"].includes(recipeData.difficulty)
        ? recipeData.difficulty
        : "easy",
      tags: Array.isArray(recipeData.tags) ? recipeData.tags : ["ai-generated"],
      createdAt: new Date(),
      // No image field - removed completely
    };

    console.log("✅ SUCCESS! Gemini recipe created:", recipe.title);
    return recipe;
  } catch (error) {
    console.error("❌ CRITICAL ERROR in Gemini generation:", error);
    console.error(
      "❌ Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return null;
  }
}

// REMOVED: All fallback functions - 100% AI generation only!

export async function generateMealPlan(
  prompt: string
): Promise<Recipe[] | null> {
  console.log("🗓️ 100% AI-Generated Meal Plan Starting:", prompt);

  // Check cache first for instant results
  const cachedMealPlan = aiCache.get(prompt, "mealplan");
  if (cachedMealPlan) {
    console.log("⚡ Instant AI meal plan from cache!");
    return cachedMealPlan;
  }

  try {
    // ONLY AI GENERATION - NO FALLBACKS!
    console.log("🤖 Generating meal plan with Gemini AI (no fallbacks)...");

    const aiMealPlan = await tryAIMealPlanGeneration(prompt);

    if (aiMealPlan && aiMealPlan.length > 0) {
      console.log("✅ AI meal plan created successfully!");
      // Cache the successful result for 10 minutes
      aiCache.set(prompt, aiMealPlan, "mealplan", 10 * 60 * 1000);
      return aiMealPlan;
    }

    console.error("❌ AI meal plan generation failed - no fallback available");
    return null;
  } catch (error) {
    console.error("❌ Meal plan generation error:", error);
    return null;
  }
}

async function tryAIMealPlanGeneration(
  prompt: string
): Promise<Recipe[] | null> {
  console.log("🤖 Connecting to Gemini for meal plan generation...");

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `You are a professional chef and meal planner. Create 7 different recipes for a weekly meal plan based on: "${prompt}".

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

Requirements:
- Create exactly 7 different recipes
- Include variety in cuisines, cooking methods, and meal types
- Each recipe should be complete and different from the others
- Include specific quantities for all ingredients
- Write clear, detailed cooking instructions
- Use realistic cooking times
- Difficulty must be "easy", "medium", or "hard"
- Include 3-5 relevant tags per recipe
- Respond with ONLY the JSON array, no additional text`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2000,
    },
  };

  // Use retry mechanism for meal plan API calls
  const result = await retryWithBackoff(async () => {
    console.log("📤 Sending meal plan request to Gemini...");

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📥 Gemini meal plan response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Gemini meal plan API error (${response.status}):`,
        errorText
      );

      // Throw error with status for retry logic
      const error = new Error(`API Error: ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }

    return response;
  });

  if (!result) {
    console.error("❌ All meal plan retry attempts failed");
    return null;
  }

  try {
    const data = await result.json();
    console.log(
      "📊 Full Gemini meal plan response:",
      JSON.stringify(data, null, 2)
    );

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("❌ Invalid Gemini meal plan response structure");
      return null;
    }

    const generatedText = data.candidates[0].content.parts[0].text.trim();
    console.log("📝 Gemini meal plan generated text:", generatedText);

    // Extract JSON from response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("❌ No JSON array found in Gemini meal plan response");
      return null;
    }

    const recipesData = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(recipesData)) {
      console.error("❌ Response is not an array");
      return null;
    }

    // Skip image generation for meal plans to save API quota
    console.log(
      "⚡ Skipping image generation for meal plans to save API quota"
    );
    const recipes: Recipe[] = recipesData.map(
      (recipeData: any, index: number) => {
        const title = recipeData.title || `Recipe ${index + 1}`;
        const ingredients = Array.isArray(recipeData.ingredients)
          ? recipeData.ingredients
          : ["Various ingredients"];

        return {
          id: `gemini_meal_plan_${Date.now()}_${index}`,
          title,
          description: recipeData.description || "A delicious meal",
          ingredients,
          instructions: Array.isArray(recipeData.instructions)
            ? recipeData.instructions
            : ["Follow cooking instructions"],
          cookingTime:
            typeof recipeData.cookingTime === "number"
              ? recipeData.cookingTime
              : 30,
          servings:
            typeof recipeData.servings === "number" ? recipeData.servings : 4,
          difficulty: ["easy", "medium", "hard"].includes(recipeData.difficulty)
            ? recipeData.difficulty
            : "easy",
          tags: Array.isArray(recipeData.tags)
            ? recipeData.tags
            : ["meal-plan"],
          createdAt: new Date(),
          // No image field - removed completely
        };
      }
    );

    console.log(`✅ Generated ${recipes.length} recipes for Gemini meal plan`);
    return recipes;
  } catch (error) {
    console.error("❌ OpenAI meal plan generation failed:", error);
    return null;
  }
}

// ALL FALLBACK FUNCTIONS REMOVED - 100% AI GENERATION ONLY!
