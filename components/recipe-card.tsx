"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Heart, Clock, Users, Star, ChefHat, Sparkles } from "lucide-react"
import type { Recipe } from "@/types/recipe"

interface RecipeCardProps {
  recipe: Recipe
  onSave: () => void
  isSaved: boolean
}

export default function RecipeCard({ recipe, onSave, isSaved }: RecipeCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-600"
      case "medium":
        return "bg-yellow-600"
      case "hard":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <>
      <Card className="glass-card backdrop-blur-xl border-white/10 hover:border-sky-400/50 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl cursor-pointer group relative overflow-hidden animate-slide-in-up">
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
        
        <div onClick={() => setShowDetails(true)}>
          {/* Header with AI Badge and Difficulty */}
          <div className="p-4 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 bg-gradient-primary px-2 py-1 rounded-full text-xs font-semibold text-white">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>AI Generated</span>
              </div>
              <Badge className={`${getDifficultyColor(recipe.difficulty)} text-white font-semibold px-3 py-1 rounded-full shadow-lg`}>
                <Star className="h-3 w-3 mr-1" />
                {recipe.difficulty}
              </Badge>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-4 sm:p-5 md:p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-white text-lg sm:text-xl font-bold line-clamp-2 text-gradient-primary">
                {recipe.title}
              </CardTitle>
              <CardDescription className="text-gray-300 line-clamp-2 text-sm sm:text-base leading-relaxed">
                {recipe.description}
              </CardDescription>
            </CardHeader>

            {/* Recipe Stats */}
            <div className="flex items-center justify-between mb-4 p-3 glass-button rounded-2xl">
              <div className="flex items-center space-x-1 text-sky-400">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-semibold">{recipe.cookingTime}m</span>
              </div>
              <div className="w-px h-4 bg-gray-600"></div>
              <div className="flex items-center space-x-1 text-emerald-400">
                <Users className="h-4 w-4" />
                <span className="text-sm font-semibold">{recipe.servings} servings</span>
              </div>
              <div className="w-px h-4 bg-gray-600"></div>
              <div className="flex items-center space-x-1 text-amber-400">
                <ChefHat className="h-4 w-4" />
                <span className="text-sm font-semibold">AI</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index} 
                  className="text-xs bg-gradient-to-r from-sky-500/20 to-emerald-500/20 text-sky-300 border-sky-400/30 hover:from-sky-500/30 hover:to-emerald-500/30 transition-all duration-300 px-2 py-1 rounded-full"
                >
                  #{tag}
                </Badge>
              ))}
              {recipe.tags.length > 3 && (
                <Badge className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-400/30 px-2 py-1 rounded-full">
                  +{recipe.tags.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onSave()
            }}
            className={`w-full transition-all duration-300 rounded-2xl py-3 font-semibold interactive-scale ${
              isSaved
                ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-red-500/25"
                : "glass-button border-sky-400/30 text-sky-300 hover:bg-gradient-to-r hover:from-sky-500/20 hover:to-emerald-500/20 hover:border-sky-400/50"
            }`}
          >
            <Heart className={`h-4 w-4 mr-2 transition-all duration-300 ${isSaved ? "fill-current animate-heartbeat" : "hover:scale-110"}`} />
            {isSaved ? "❤️ Saved to Collection" : "💝 Save Recipe"}
          </Button>
        </div>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="glass-card backdrop-blur-2xl border-white/10 text-white max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl animate-scale-in">
          <DialogHeader className="pb-6 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl md:text-3xl font-bold text-gradient-primary mb-2">
                  {recipe.title}
                </DialogTitle>
                <DialogDescription className="text-gray-300 text-base md:text-lg leading-relaxed">
                  {recipe.description}
                </DialogDescription>
              </div>
              <div className="ml-4 flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-gradient-primary px-3 py-1 rounded-full text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>AI Recipe</span>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Recipe Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pt-6">
            <div className="glass-button p-4 rounded-2xl text-center group hover:bg-sky-500/10 transition-all duration-300">
              <Clock className="h-6 w-6 text-sky-400 mx-auto mb-2 group-hover:animate-wiggle" />
              <div className="text-lg font-bold text-white">{recipe.cookingTime}</div>
              <div className="text-xs text-gray-400">minutes</div>
            </div>
            <div className="glass-button p-4 rounded-2xl text-center group hover:bg-emerald-500/10 transition-all duration-300">
              <Users className="h-6 w-6 text-emerald-400 mx-auto mb-2 group-hover:animate-wiggle" />
              <div className="text-lg font-bold text-white">{recipe.servings}</div>
              <div className="text-xs text-gray-400">servings</div>
            </div>
            <div className="glass-button p-4 rounded-2xl text-center group hover:bg-amber-500/10 transition-all duration-300">
              <Star className="h-6 w-6 text-amber-400 mx-auto mb-2 group-hover:animate-wiggle" />
              <div className="text-lg font-bold text-white capitalize">{recipe.difficulty}</div>
              <div className="text-xs text-gray-400">difficulty</div>
            </div>
            <div className="glass-button p-4 rounded-2xl text-center group hover:bg-purple-500/10 transition-all duration-300">
              <ChefHat className="h-6 w-6 text-purple-400 mx-auto mb-2 group-hover:animate-wiggle" />
              <div className="text-lg font-bold text-white">{recipe.tags.length}</div>
              <div className="text-xs text-gray-400">tags</div>
            </div>
          </div>

          {/* Side-by-Side Layout for Ingredients and Instructions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Ingredients */}
            <div className="glass-button p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-gradient-primary mb-4 flex items-center">
                <ChefHat className="h-6 w-6 mr-2 animate-float" />
                Ingredients
                <div className="ml-2 bg-sky-500/20 text-sky-300 text-xs px-2 py-1 rounded-full">
                  {recipe.ingredients.length} items
                </div>
              </h3>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start group hover:bg-white/5 p-2 rounded-xl transition-all duration-300">
                    <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 group-hover:animate-pulse">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <span className="text-gray-200 leading-relaxed">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column - Instructions */}
            <div className="glass-button p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-gradient-accent mb-4 flex items-center">
                <Star className="h-6 w-6 mr-2 animate-glow" />
                Instructions
                <div className="ml-2 bg-amber-500/20 text-amber-300 text-xs px-2 py-1 rounded-full">
                  {recipe.instructions.length} steps
                </div>
              </h3>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start group hover:bg-white/5 p-3 rounded-xl transition-all duration-300">
                    <div className="bg-gradient-accent text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 mt-0.5 group-hover:animate-bounce shadow-lg">
                      {index + 1}
                    </div>
                    <span className="text-gray-200 leading-relaxed">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Tags Section */}
          <div className="glass-button p-6 rounded-2xl mt-6">
            <h3 className="text-lg font-bold text-gradient-secondary mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 animate-pulse" />
              Recipe Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  className="bg-gradient-to-r from-sky-500/20 to-emerald-500/20 text-sky-300 border-sky-400/30 hover:from-sky-500/30 hover:to-emerald-500/30 transition-all duration-300 px-3 py-2 rounded-full interactive-scale"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onSave()
              }}
              className={`flex-1 transition-all duration-300 rounded-2xl py-3 font-semibold interactive-scale ${
                isSaved
                  ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-red-500/25"
                  : "bg-gradient-primary hover:bg-gradient-secondary text-white shadow-lg hover:shadow-sky-500/25"
              }`}
            >
              <Heart className={`h-4 w-4 mr-2 transition-all duration-300 ${isSaved ? "fill-current animate-heartbeat" : ""}`} />
              {isSaved ? "❤️ Saved" : "💝 Save Recipe"}
            </Button>
            <Button
              onClick={() => setShowDetails(false)}
              variant="outline"
              className="flex-1 glass-button border-white/20 text-white hover:bg-white/10 rounded-2xl py-3 font-semibold interactive-scale"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
