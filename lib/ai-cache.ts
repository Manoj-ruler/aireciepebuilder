// Simple in-memory cache for AI responses to avoid duplicate API calls
interface CacheEntry {
  data: any
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class AICache {
  private cache = new Map<string, CacheEntry>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  private generateKey(prompt: string, type: 'recipe' | 'mealplan'): string {
    // Create a simple hash of the prompt for caching
    const normalized = prompt.toLowerCase().trim()
    return `${type}:${btoa(normalized).slice(0, 20)}`
  }

  set(prompt: string, data: any, type: 'recipe' | 'mealplan', ttl?: number): void {
    const key = this.generateKey(prompt, type)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    })
    
    // Clean up expired entries periodically
    this.cleanup()
  }

  get(prompt: string, type: 'recipe' | 'mealplan'): any | null {
    const key = this.generateKey(prompt, type)
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    console.log(`🚀 Cache hit for ${type}:`, prompt.substring(0, 50) + '...')
    return entry.data
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

export const aiCache = new AICache()