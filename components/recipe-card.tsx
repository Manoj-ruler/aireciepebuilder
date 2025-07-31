"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Heart, Clock, Users } from "lucide-react"
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
      <Card className="bg-gray-800 border-gray-700 hover:border-orange-500 transition-all duration-300 transform hover:scale-105 cursor-pointer group">
        <div onClick={() => setShowDetails(true)}>
          <div className="relative overflow-hidden rounded-t-lg bg-gray-700">
            {!imageLoaded && !imageError && (
              <div className="w-full h-48 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">🎨 Generating AI image...</div>
              </div>
            )}
            <img
              src={recipe.imageUrl || "/placeholder.svg"}
              alt={recipe.title}
              className={`w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true)
                setImageLoaded(true)
              }}
            />
            {imageError && (
              <div className="absolute inset-0 w-full h-48 flex items-center justify-center bg-gray-700">
                <div className="text-gray-400 text-center">
                  <div className="text-2xl mb-2">🍽️</div>
                  <div className="text-sm">Recipe Image</div>
                </div>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge className={`${getDifficultyColor(recipe.difficulty)} text-white`}>{recipe.difficulty}</Badge>
            </div>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg line-clamp-2">{recipe.title}</CardTitle>
            <CardDescription className="text-gray-400 line-clamp-2">{recipe.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {recipe.cookingTime}m
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {recipe.servings} servings
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                  {tag}
                </Badge>
              ))}
              {recipe.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                  +{recipe.tags.length - 3}
                </Badge>
              )}
            </div>
          </CardContent>
        </div>
        <div className="px-6 pb-4">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onSave()
            }}
            variant="outline"
            size="sm"
            className={`w-full ${
              isSaved
                ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
                : "border-gray-600 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Heart className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "Saved" : "Save Recipe"}
          </Button>
        </div>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{recipe.title}</DialogTitle>
            <DialogDescription className="text-gray-400">{recipe.description}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="relative bg-gray-700 rounded-lg overflow-hidden">
                <img
                  src={recipe.imageUrl || "/placeholder.svg"}
                  alt={recipe.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between mt-4 p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-500" />
                  <span>{recipe.cookingTime} minutes</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-orange-500" />
                  <span>{recipe.servings} servings</span>
                </div>
                <Badge className={`${getDifficultyColor(recipe.difficulty)} text-white`}>{recipe.difficulty}</Badge>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-300">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                <ol className="space-y-3">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-gray-300">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
