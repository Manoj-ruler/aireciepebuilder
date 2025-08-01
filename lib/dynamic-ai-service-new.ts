import type { Recipe } from "@/types/recipe"
// Removed image generation import to save API quota

// Gemini API configuration for 100% AI-generated dynamic meal planning
const GEMINI_API_KEY = "AIzaSyBP5Vd4HsD0s2ds3ZYQpSBtq5N9fgGq2rE";
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

export async function generateDynamicMealPlan(prompt: string, constraints: PlanConstraints): Promise<Recipe[] | null> {
  console.log("🍽️ 100% AI-Generated Dynamic Meal Plan Starting...")
  console.log("Constraints:", constraints)

  try {
    // Calculate total meals needed
    const totalMeals = constraints.days * constraints.mealTypes.length
    console.log(`📊 Need ${totalMeals} meals (${constraints.days} days × ${constraints.mealTypes.length} meal types)`)

    // Build detailed prompt with constraints
    const constraintsText = buildConstraintsPrompt(constraints)
    const fullPrompt = `${prompt}\n\nConstraints: ${constraintsText}`

    console.log("🤖 Generating dynamic meal plan with Gemini AI (no fallbacks)...")

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You are a professional chef and meal planner. Create ${totalMeals} different recipes for a ${constraints.days}-day meal plan based on: "${fullPrompt}".

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
    "tags": ["tag1", "tag2"],
    "estimatedCost": 12.50
  }
]

Requirements:
- Create exactly ${totalMeals} different recipes
- Include variety in cuisines, cooking methods, and meal types
- Each recipe should be complete and different from the others
- Include specific quantities for all ingredients
- Write clear, detailed cooking instructions
- Use realistic cooking times (max ${constraints.maxCookingTime} minutes each)
- Difficulty must be "easy", "medium", or "hard"
- Include 3-5 relevant tags per recipe
- Add estimated cost per recipe (within budget of $${constraints.budget} total)
- Consider dietary restrictions: ${constraints.dietaryRestrictions.join(', ') || 'none'}
- Preferred proteins: ${constraints.preferredProteins.join(', ') || 'any'}
- Avoid ingredients: ${constraints.avoidIngredients.join(', ') || 'none'}
- Cuisine preferences: ${constraints.cuisinePreferences.join(', ') || 'any'}
- Skill level: ${constraints.skillLevel}
- Meal types: ${constraints.mealTypes.join(', ')}
- Respond with ONLY the JSON array, no additional text`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 3000,
      },
    };

    console.log("📤 Sending dynamic meal plan request to Gemini...");

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📥 Gemini dynamic meal plan response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Gemini dynamic meal plan API error (${response.status}):`, errorText);
      return null;
    }

    const data = await response.json();
    console.log("📊 Full Gemini dynamic meal plan response:", JSON.stringify(data, null, 2));

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("❌ Invalid Gemini dynamic meal plan response structure");
      return null;
    }

    const generatedText = data.candidates[0].content.parts[0].text.trim();
    console.log("📝 Gemini dynamic meal plan generated text:", generatedText);

    // Extract JSON from response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("❌ No JSON array found in Gemini dynamic meal plan response");
      return null;
    }

    const recipesData = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(recipesData)) {
      console.error("❌ Response is not an array");
      return null;
    }

    // No image generation - removed completely to save API quota
    console.log("⚡ No image generation - removed completely to save API quota");
    const recipes: Recipe[] = recipesData.map((recipeData: any, index: number) => {
      const title = recipeData.title || `Recipe ${index + 1}`;
      const ingredients = Array.isArray(recipeData.ingredients) 
        ? recipeData.ingredients 
        : ["Various ingredients"];
      
      return {
        id: `gemini_dynamic_${Date.now()}_${index}`,
        title,
        description: recipeData.description || "A delicious AI-generated meal",
        ingredients,
        instructions: Array.isArray(recipeData.instructions) 
          ? recipeData.instructions 
          : ["Follow cooking instructions"],
        cookingTime: typeof recipeData.cookingTime === "number" ? recipeData.cookingTime : 30,
        servings: typeof recipeData.servings === "number" ? recipeData.servings : 4,
        difficulty: ["easy", "medium", "hard"].includes(recipeData.difficulty) ? recipeData.difficulty : "easy",
        tags: Array.isArray(recipeData.tags) ? recipeData.tags : ["ai-generated"],
        createdAt: new Date(),
        // No image field - removed completely
      };
    });

    // Add estimated cost to each recipe
    recipes.forEach((recipe, index) => {
      (recipe as any).estimatedCost = recipesData[index]?.estimatedCost || constraints.budget / totalMeals;
    });

    console.log(`✅ Generated ${recipes.length} AI recipes for dynamic meal plan`);
    return recipes;
  } catch (error) {
    console.error("❌ Gemini dynamic meal plan generation failed:", error);
    return null;
  }
}

export async function adjustMealPlan(
  currentPlan: Recipe[],
  feedback: PlanFeedback[],
  adjustmentRequest: string,
): Promise<Recipe[] | null> {
  console.log("🔄 100% AI-Generated Meal Plan Adjustment Starting...")
  console.log("Adjustment request:", adjustmentRequest)
  console.log("Feedback:", feedback)

  try {
    const feedbackText = feedback.map(f => `Recipe "${currentPlan.find(r => r.id === f.recipeId)?.title}": ${f.rating} - ${f.feedback}`).join('\n')
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You are a professional chef and meal planner. Adjust the following meal plan based on user feedback and requests.

Current meal plan:
${JSON.stringify(currentPlan.map(r => ({ title: r.title, description: r.description, tags: r.tags })), null, 2)}

User feedback:
${feedbackText}

Adjustment request: "${adjustmentRequest}"

Create an improved meal plan with the same number of recipes (${currentPlan.length}). Replace disliked recipes and improve the overall plan based on the feedback.

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
    "tags": ["tag1", "tag2"],
    "estimatedCost": 12.50
  }
]

Requirements:
- Create exactly ${currentPlan.length} different recipes
- Address all user feedback and adjustment requests
- Keep liked recipes similar but improve disliked ones
- Include specific quantities for all ingredients
- Write clear, detailed cooking instructions
- Use realistic cooking times
- Difficulty must be "easy", "medium", or "hard"
- Include 3-5 relevant tags per recipe
- Add estimated cost per recipe
- Respond with ONLY the JSON array, no additional text`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 3000,
      },
    };

    console.log("📤 Sending meal plan adjustment request to Gemini...");

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Gemini meal plan adjustment API error (${response.status}):`, errorText);
      return null;
    }

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("❌ Invalid Gemini meal plan adjustment response structure");
      return null;
    }

    const generatedText = data.candidates[0].content.parts[0].text.trim();
    console.log("📝 Gemini meal plan adjustment generated text:", generatedText);

    // Extract JSON from response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("❌ No JSON array found in Gemini meal plan adjustment response");
      return null;
    }

    const recipesData = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(recipesData)) {
      console.error("❌ Response is not an array");
      return null;
    }

    // No image generation - removed completely to save API quota
    console.log("⚡ No image generation - removed completely to save API quota");
    const adjustedRecipes: Recipe[] = recipesData.map((recipeData: any, index: number) => {
      const title = recipeData.title || `Adjusted Recipe ${index + 1}`;
      const ingredients = Array.isArray(recipeData.ingredients) 
        ? recipeData.ingredients 
        : ["Various ingredients"];
      
      return {
        id: `gemini_adjusted_${Date.now()}_${index}`,
        title,
        description: recipeData.description || "An improved AI-generated meal",
        ingredients,
        instructions: Array.isArray(recipeData.instructions) 
          ? recipeData.instructions 
          : ["Follow cooking instructions"],
        cookingTime: typeof recipeData.cookingTime === "number" ? recipeData.cookingTime : 30,
        servings: typeof recipeData.servings === "number" ? recipeData.servings : 4,
        difficulty: ["easy", "medium", "hard"].includes(recipeData.difficulty) ? recipeData.difficulty : "easy",
        tags: Array.isArray(recipeData.tags) ? recipeData.tags : ["ai-generated"],
        createdAt: new Date(),
        // No image field - removed completely
      };
    });

    // Add estimated cost to each recipe
    adjustedRecipes.forEach((recipe, index) => {
      (recipe as any).estimatedCost = recipesData[index]?.estimatedCost || 10;
    });

    console.log(`✅ Generated ${adjustedRecipes.length} adjusted AI recipes`);
    return adjustedRecipes;
  } catch (error) {
    console.error("❌ Gemini meal plan adjustment failed:", error);
    return null;
  }
}

function buildConstraintsPrompt(constraints: PlanConstraints): string {
  const parts = [];
  
  if (constraints.budget > 0) {
    parts.push(`Budget: $${constraints.budget}`);
  }
  
  if (constraints.maxCookingTime < 120) {
    parts.push(`Max cooking time: ${constraints.maxCookingTime} minutes`);
  }
  
  if (constraints.dietaryRestrictions.length > 0) {
    parts.push(`Dietary restrictions: ${constraints.dietaryRestrictions.join(', ')}`);
  }
  
  if (constraints.preferredProteins.length > 0) {
    parts.push(`Preferred proteins: ${constraints.preferredProteins.join(', ')}`);
  }
  
  if (constraints.avoidIngredients.length > 0) {
    parts.push(`Avoid: ${constraints.avoidIngredients.join(', ')}`);
  }
  
  if (constraints.cuisinePreferences.length > 0) {
    parts.push(`Cuisine preferences: ${constraints.cuisinePreferences.join(', ')}`);
  }
  
  parts.push(`Skill level: ${constraints.skillLevel}`);
  parts.push(`Meal types: ${constraints.mealTypes.join(', ')}`);
  
  return parts.join(', ');
}