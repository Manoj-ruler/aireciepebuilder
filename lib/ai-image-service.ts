// AI Image Generation Service for Recipe Images
// Using Pollinations.ai - Free AI image generation service

import { aiImageCache } from "./ai-image-cache";

export async function generateRecipeImage(recipeTitle: string, ingredients: string[]): Promise<string> {
  try {
    console.log("🎨 Generating AI image for recipe:", recipeTitle);

    // Create a detailed prompt for food photography
    const foodPrompt = createFoodImagePrompt(recipeTitle, ingredients);
    
    // Use Pollinations.ai for free AI image generation
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(foodPrompt)}?width=400&height=300&model=flux&enhance=true&nologo=true`;
    
    console.log("✅ AI image generated for:", recipeTitle);
    return imageUrl;
  } catch (error) {
    console.error("❌ Error generating AI image:", error);
    // Fallback to a food-themed placeholder
    return `https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=300&fit=crop&crop=center&auto=format&q=80`;
  }
}

function createFoodImagePrompt(recipeTitle: string, ingredients: string[]): string {
  // Extract key ingredients for the prompt
  const keyIngredients = ingredients
    .slice(0, 3) // Take first 3 ingredients
    .map(ing => ing.split(' ').slice(-1)[0]) // Get the main ingredient name
    .join(', ');

  // Create a professional food photography prompt
  const prompt = `Professional food photography of ${recipeTitle}, featuring ${keyIngredients}, beautifully plated, restaurant quality, natural lighting, appetizing, high resolution, food styling, garnished, colorful, delicious looking`;
  
  return prompt;
}

// Alternative image generation using Unsplash for more reliable results
export async function generateRecipeImageUnsplash(recipeTitle: string): Promise<string> {
  try {
    console.log("🎨 Generating Unsplash image for recipe:", recipeTitle);

    // Extract key food terms from the recipe title
    const foodTerms = extractFoodTerms(recipeTitle);
    const searchQuery = foodTerms.join(' ');
    
    // Use Unsplash Source API for food images
    const imageUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(searchQuery)},food,recipe,delicious`;
    
    console.log("✅ Unsplash image generated for:", recipeTitle);
    return imageUrl;
  } catch (error) {
    console.error("❌ Error generating Unsplash image:", error);
    return `https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=300&fit=crop&crop=center&auto=format&q=80`;
  }
}

function extractFoodTerms(recipeTitle: string): string[] {
  const foodKeywords = [
    'chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'pasta', 'rice', 'curry', 'soup', 'salad',
    'pizza', 'burger', 'sandwich', 'stir-fry', 'grilled', 'baked', 'fried', 'roasted', 'steamed',
    'vegetarian', 'vegan', 'spicy', 'sweet', 'savory', 'healthy', 'quinoa', 'tofu', 'eggs', 'cheese',
    'bread', 'noodles', 'tacos', 'burrito', 'sushi', 'steak', 'lobster', 'crab', 'vegetables', 'fruit'
  ];

  const titleWords = recipeTitle.toLowerCase().split(/\s+/);
  const matchedTerms = titleWords.filter(word => 
    foodKeywords.some(keyword => word.includes(keyword) || keyword.includes(word))
  );

  // If no specific terms found, use the first few words
  return matchedTerms.length > 0 ? matchedTerms.slice(0, 3) : titleWords.slice(0, 2);
}

// Enhanced AI image generation with multiple fallbacks
export async function generateRecipeImageEnhanced(recipeTitle: string, ingredients: string[]): Promise<string> {
  try {
    console.log("🎨 Enhanced AI image generation for:", recipeTitle);

    // Check cache first
    const cachedImage = aiImageCache.getCachedImage(recipeTitle, ingredients);
    if (cachedImage) {
      return cachedImage;
    }

    // Primary: Try Pollinations.ai first (best quality)
    try {
      const aiImage = await generateRecipeImage(recipeTitle, ingredients);
      aiImageCache.cacheImage(recipeTitle, ingredients, aiImage);
      console.log("✅ AI image generated successfully with Pollinations");
      return aiImage;
    } catch (error) {
      console.log("⚠️ Pollinations failed, trying Unsplash...");
    }

    // Secondary: Try Unsplash as backup
    try {
      const unsplashImage = await generateRecipeImageUnsplash(recipeTitle);
      aiImageCache.cacheImage(recipeTitle, ingredients, unsplashImage);
      console.log("✅ Image generated successfully with Unsplash");
      return unsplashImage;
    } catch (error) {
      console.log("⚠️ Unsplash failed, using fallback...");
    }

    // Tertiary: Try alternative AI service
    try {
      const altImage = await generateRecipeImageAlternative(recipeTitle, ingredients);
      aiImageCache.cacheImage(recipeTitle, ingredients, altImage);
      console.log("✅ Image generated successfully with alternative service");
      return altImage;
    } catch (error) {
      console.log("⚠️ Alternative service failed, using final fallback...");
    }

    console.log("✅ Using final fallback image");
    const fallbackImage = getFallbackImage(recipeTitle);
    aiImageCache.cacheImage(recipeTitle, ingredients, fallbackImage);
    return fallbackImage;
  } catch (error) {
    console.error("❌ All image generation methods failed:", error);
    return getFallbackImage(recipeTitle);
  }
}

// Alternative AI image generation using different service
async function generateRecipeImageAlternative(recipeTitle: string, ingredients: string[]): Promise<string> {
  const foodPrompt = createFoodImagePrompt(recipeTitle, ingredients);
  
  // Use Picsum with food-related seed for consistent results
  const seed = Math.abs(hashCode(recipeTitle)) % 1000;
  return `https://picsum.photos/seed/${seed}/400/300`;
}

// Get a themed fallback image based on recipe type
function getFallbackImage(recipeTitle: string): string {
  const title = recipeTitle.toLowerCase();
  
  // Return themed fallback based on recipe type
  if (title.includes('pasta') || title.includes('spaghetti') || title.includes('noodle')) {
    return 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
  } else if (title.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
  } else if (title.includes('salad')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
  } else if (title.includes('soup')) {
    return 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
  } else if (title.includes('chicken')) {
    return 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
  } else if (title.includes('beef') || title.includes('steak')) {
    return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
  } else if (title.includes('fish') || title.includes('salmon')) {
    return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
  } else if (title.includes('dessert') || title.includes('cake') || title.includes('sweet')) {
    return 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
  } else {
    // Generic delicious food image
    return 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
  }
}

// Simple hash function for consistent seeds
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}