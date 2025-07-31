// AI Image Cache Service
// Caches generated images to avoid regenerating the same content

interface ImageCacheEntry {
  url: string;
  timestamp: number;
  recipeTitle: string;
}

class AIImageCache {
  private cache = new Map<string, ImageCacheEntry>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 100; // Maximum cached images

  // Generate cache key from recipe title and ingredients
  private generateCacheKey(recipeTitle: string, ingredients: string[]): string {
    const keyIngredients = ingredients.slice(0, 3).join(',');
    return `${recipeTitle.toLowerCase().trim()}-${keyIngredients.toLowerCase()}`;
  }

  // Get cached image URL if available and not expired
  getCachedImage(recipeTitle: string, ingredients: string[]): string | null {
    const key = this.generateCacheKey(recipeTitle, ingredients);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if cache entry is expired
    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    console.log("🎯 Using cached AI image for:", recipeTitle);
    return entry.url;
  }

  // Cache a generated image URL
  cacheImage(recipeTitle: string, ingredients: string[], imageUrl: string): void {
    const key = this.generateCacheKey(recipeTitle, ingredients);
    
    // If cache is full, remove oldest entries
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanupOldEntries();
    }

    const entry: ImageCacheEntry = {
      url: imageUrl,
      timestamp: Date.now(),
      recipeTitle: recipeTitle
    };

    this.cache.set(key, entry);
    console.log("💾 Cached AI image for:", recipeTitle);
  }

  // Remove expired entries and oldest entries if cache is full
  private cleanupOldEntries(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    // Remove expired entries first
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    });

    // If still too many entries, remove oldest ones
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const sortedEntries = entries
        .filter(([key]) => this.cache.has(key)) // Only keep non-expired entries
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);

      const entriesToRemove = sortedEntries.slice(0, this.cache.size - this.MAX_CACHE_SIZE + 10);
      entriesToRemove.forEach(([key]) => {
        this.cache.delete(key);
      });
    }
  }

  // Get cache statistics
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: 0 // Could be implemented with hit/miss counters
    };
  }

  // Clear all cached images
  clearCache(): void {
    this.cache.clear();
    console.log("🗑️ AI image cache cleared");
  }
}

// Export singleton instance
export const aiImageCache = new AIImageCache();