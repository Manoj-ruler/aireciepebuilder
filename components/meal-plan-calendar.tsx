"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, Sparkles, Loader2, Clock, Users, Star, ChefHat, Heart, X, Youtube, ExternalLink } from "lucide-react"
import type { Recipe, MealPlan } from "@/types/recipe"
import { generateMealPlan } from "@/lib/ai-service"
import { useToast } from "@/hooks/use-toast"

interface MealPlanCalendarProps {
  mealPlans: MealPlan[]
  recipes: Recipe[]
  onAddMealPlan: (mealPlan: MealPlan) => void
  onSaveRecipe?: (recipe: Recipe) => void
}

export default function MealPlanCalendar({ mealPlans, recipes, onAddMealPlan, onSaveRecipe }: MealPlanCalendarProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedMeal, setSelectedMeal] = useState<"breakfast" | "lunch" | "dinner">("breakfast")
  const [selectedRecipe, setSelectedRecipe] = useState("")
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [showRecipeModal, setShowRecipeModal] = useState(false)
  const [selectedRecipeForModal, setSelectedRecipeForModal] = useState<Recipe | null>(null)
  const { toast } = useToast()

  const today = new Date()
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    return date
  })

  const handleAddMealPlan = () => {
    if (!selectedDate || !selectedRecipe) {
      toast({
        title: "Error",
        description: "Please select both date and recipe",
        variant: "destructive",
      })
      return
    }

    const recipe = recipes.find((r) => r.id === selectedRecipe)
    if (!recipe) return

    const mealPlan: MealPlan = {
      id: Date.now().toString(),
      date: new Date(selectedDate),
      mealType: selectedMeal,
      recipeId: selectedRecipe,
      recipe: recipe,
      createdAt: new Date(),
    }

    onAddMealPlan(mealPlan)
    setShowAddDialog(false)
    setSelectedDate("")
    setSelectedRecipe("")

    toast({
      title: "Success!",
      description: "Meal added to your plan",
    })
  }

  const handleGenerateWeeklyPlan = async () => {
    setIsGeneratingPlan(true)
    try {
      toast({
        title: "🤖 AI Chef Working...",
        description: "Creating your complete 7-day meal plan (21 meals total)",
      })

      // Generate 21 recipes for a complete week (7 days × 3 meals)
      const mealPrompts = [
        // Day 1
        "Generate a healthy breakfast recipe with eggs and vegetables",
        "Create a light lunch recipe with salad and protein", 
        "Make a hearty dinner recipe with chicken or fish",
        // Day 2
        "Generate a quick breakfast recipe with oats or yogurt",
        "Create a sandwich or wrap recipe for lunch",
        "Make a pasta or rice dinner recipe",
        // Day 3
        "Generate a smoothie bowl or pancake breakfast recipe",
        "Create a soup and bread lunch recipe",
        "Make a vegetarian dinner recipe",
        // Day 4
        "Generate a toast or cereal breakfast recipe",
        "Create a grain bowl lunch recipe",
        "Make a beef or pork dinner recipe",
        // Day 5
        "Generate a fruit and protein breakfast recipe",
        "Create a leftover-friendly lunch recipe",
        "Make a seafood dinner recipe",
        // Day 6
        "Generate a weekend brunch-style breakfast recipe",
        "Create a picnic-style lunch recipe",
        "Make a comfort food dinner recipe",
        // Day 7
        "Generate a special Sunday breakfast recipe",
        "Create a family-style lunch recipe",
        "Make a celebration dinner recipe"
      ]

      const weeklyRecipes: Recipe[] = []
      
      // Generate recipes in batches to avoid overwhelming the API
      for (let i = 0; i < mealPrompts.length; i++) {
        try {
          const recipe = await generateMealPlan(mealPrompts[i])
          if (recipe && recipe.length > 0) {
            weeklyRecipes.push(recipe[0])
          }
          
          // Update progress
          if (i % 3 === 2) { // Every 3 recipes (1 day complete)
            const dayComplete = Math.floor(i / 3) + 1
            toast({
              title: `Day ${dayComplete} Complete! 🎉`,
              description: `Generated ${i + 1} of 21 meals...`,
            })
          }
        } catch (error) {
          console.error(`Error generating recipe ${i + 1}:`, error)
          // Continue with next recipe even if one fails
        }
      }

      if (weeklyRecipes.length > 0) {
        // Clear existing meal plans for this week
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate())

        // Add the generated recipes to the meal plan
        const mealTypes: ("breakfast" | "lunch" | "dinner")[] = ["breakfast", "lunch", "dinner"]

        weeklyRecipes.forEach((recipe, index) => {
          const dayIndex = Math.floor(index / 3)
          const mealTypeIndex = index % 3
          const date = new Date(startOfWeek)
          date.setDate(startOfWeek.getDate() + dayIndex)

          const mealPlan: MealPlan = {
            id: `generated-${Date.now()}-${index}`,
            date: date,
            mealType: mealTypes[mealTypeIndex],
            recipeId: recipe.id,
            recipe: recipe,
            createdAt: new Date(),
          }

          onAddMealPlan(mealPlan)
        })

        toast({
          title: "🎊 Complete Weekly Plan Generated!",
          description: `Successfully created ${weeklyRecipes.length} meals for your week!`,
        })
      } else {
        toast({
          title: "Generation Failed",
          description: "Unable to generate meal plan. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating weekly plan:", error)
      toast({
        title: "Error",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  const getMealsForDate = (date: Date) => {
    return mealPlans.filter((plan) => {
      const planDate = new Date(plan.date)
      return planDate.toDateString() === date.toDateString()
    })
  }

  // Generate YouTube search URL for the recipe
  const getYouTubeSearchUrl = (recipeTitle: string) => {
    const searchQuery = `${recipeTitle} recipe cooking tutorial`
    const encodedQuery = encodeURIComponent(searchQuery)
    return `https://www.youtube.com/results?search_query=${encodedQuery}`
  }

  return (
    <div className="space-y-8 animate-slide-in-up">
      {/* Enhanced Header */}
      <div className="glass-card p-6 rounded-3xl backdrop-blur-xl border-white/10">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Calendar className="h-10 w-10 text-sky-400 animate-glow" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-secondary rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gradient-primary">Weekly Meal Plan</h2>
              <p className="text-sky-600/80 font-medium">Plan your culinary week with AI assistance</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Button
              onClick={handleGenerateWeeklyPlan}
              disabled={isGeneratingPlan}
              className="bg-gradient-secondary hover:bg-gradient-accent text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 interactive-scale"
            >
              {isGeneratingPlan ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span className="animate-pulse">AI Creating Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-wiggle" />
                  🤖 AI Weekly Plan
                </>
              )}
            </Button>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-accent hover:bg-gradient-primary text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-300 interactive-scale">
                  <Plus className="mr-2 h-5 w-5" />
                  ➕ Add Meal
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card backdrop-blur-2xl border-white/10 text-white max-w-md rounded-3xl animate-scale-in">
                <DialogHeader className="pb-6 border-b border-white/10">
                  <DialogTitle className="text-2xl font-bold text-gradient-primary">Add Meal to Plan</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Schedule a delicious recipe for a specific date and meal time
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 pt-6">
                  <div>
                    <label className="text-sm font-semibold text-sky-300 mb-2 block">📅 Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-3 glass-button border-white/20 rounded-2xl text-white focus-ring transition-all duration-300"
                      min={today.toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-emerald-300 mb-2 block">🍽️ Meal Type</label>
                    <Select
                      value={selectedMeal}
                      onValueChange={(value: "breakfast" | "lunch" | "dinner") => setSelectedMeal(value)}
                    >
                      <SelectTrigger className="glass-button border-white/20 text-white rounded-2xl p-3 focus-ring">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10 rounded-2xl">
                        <SelectItem value="breakfast" className="text-white hover:bg-white/10 rounded-xl">🌅 Breakfast</SelectItem>
                        <SelectItem value="lunch" className="text-white hover:bg-white/10 rounded-xl">☀️ Lunch</SelectItem>
                        <SelectItem value="dinner" className="text-white hover:bg-white/10 rounded-xl">🌙 Dinner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-amber-300 mb-2 block">👨‍🍳 Recipe</label>
                    <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
                      <SelectTrigger className="glass-button border-white/20 text-white rounded-2xl p-3 focus-ring">
                        <SelectValue placeholder="Choose your recipe..." />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10 rounded-2xl max-h-60">
                        {recipes.length > 0 ? (
                          recipes.map((recipe) => (
                            <SelectItem key={recipe.id} value={recipe.id} className="text-white hover:bg-white/10 rounded-xl">
                              <div className="flex items-center space-x-2">
                                <span>🍽️</span>
                                <span>{recipe.title}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-recipes" disabled className="text-gray-400">
                            No recipes available - create some first! 🍳
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleAddMealPlan}
                    className="w-full bg-gradient-primary hover:bg-gradient-secondary text-white py-3 rounded-2xl font-semibold shadow-lg hover:shadow-sky-500/25 transition-all duration-300 interactive-scale"
                    disabled={!selectedDate || !selectedRecipe || recipes.length === 0}
                  >
                    ✨ Add to Meal Plan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Enhanced Calendar Grid with Better Visual Hierarchy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4">
        {weekDays.map((date, index) => {
          const meals = getMealsForDate(date)
          const isToday = date.toDateString() === today.toDateString()
          const dayName = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()
          const monthName = date.toLocaleDateString("en-US", { month: "short" })

          return (
            <Card 
              key={index} 
              className={`relative overflow-hidden transition-all duration-500 transform hover:scale-[1.02] animate-slide-in-up ${
                isToday 
                  ? "bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-300 shadow-xl shadow-sky-200/50" 
                  : "bg-white/95 backdrop-blur-sm border border-gray-200/50 hover:border-sky-200 hover:shadow-lg"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Today Indicator */}
              {isToday && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-blue-500"></div>
              )}

              {/* Day Header */}
              <CardHeader className="pb-2 pt-4 text-center relative">
                <CardTitle className="space-y-1">
                  <div className={`text-xs font-bold tracking-wider ${
                    isToday ? "text-sky-600" : "text-gray-500"
                  }`}>
                    {dayName}
                  </div>
                  <div className={`text-2xl md:text-3xl font-bold transition-all duration-300 ${
                    isToday 
                      ? "text-sky-700" 
                      : "text-gray-800"
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="text-xs text-gray-400 font-medium">
                    {monthName} {date.getFullYear()}
                  </div>
                </CardTitle>
                {isToday && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-sky-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </CardHeader>
              
              {/* Meals Section */}
              <CardContent className="pt-0 pb-4 space-y-2">
                {["breakfast", "lunch", "dinner"].map((mealType, mealIndex) => {
                  const meal = meals.find((m) => m.mealType === mealType)
                  const mealConfig = {
                    breakfast: { 
                      emoji: "🌅", 
                      color: "bg-gradient-to-r from-amber-100 to-orange-100", 
                      textColor: "text-amber-800",
                      borderColor: "border-amber-200",
                      hoverColor: "hover:from-amber-200 hover:to-orange-200"
                    },
                    lunch: { 
                      emoji: "☀️", 
                      color: "bg-gradient-to-r from-emerald-100 to-teal-100", 
                      textColor: "text-emerald-800",
                      borderColor: "border-emerald-200",
                      hoverColor: "hover:from-emerald-200 hover:to-teal-200"
                    },
                    dinner: { 
                      emoji: "🌙", 
                      color: "bg-gradient-to-r from-purple-100 to-indigo-100", 
                      textColor: "text-purple-800",
                      borderColor: "border-purple-200",
                      hoverColor: "hover:from-purple-200 hover:to-indigo-200"
                    }
                  }
                  
                  const config = mealConfig[mealType as keyof typeof mealConfig]
                  
                  return (
                    <div key={mealType} className="space-y-1">
                      {/* Meal Type Header */}
                      <div className="flex items-center space-x-2 px-1">
                        <span className="text-sm">{config.emoji}</span>
                        <span className="text-xs font-semibold text-gray-600 capitalize">
                          {mealType}
                        </span>
                      </div>
                      
                      {meal ? (
                        <div 
                          className={`${config.color} ${config.hoverColor} border ${config.borderColor} p-3 rounded-xl cursor-pointer transition-all duration-300 group hover:shadow-md relative overflow-hidden`}
                          onClick={() => {
                            setSelectedRecipeForModal(meal.recipe)
                            setShowRecipeModal(true)
                          }}
                        >
                          {/* Recipe Title */}
                          <div className={`font-semibold text-sm line-clamp-2 mb-2 ${config.textColor} group-hover:text-opacity-90`}>
                            {meal.recipe.title}
                          </div>
                          
                          {/* Recipe Stats */}
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span className="font-medium">{meal.recipe.cookingTime}m</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span className="font-medium">{meal.recipe.servings}</span>
                            </div>
                          </div>
                          
                          {/* Recipe Tags */}
                          {meal.recipe.tags && meal.recipe.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {meal.recipe.tags.slice(0, 2).map((tag, tagIndex) => (
                                <span 
                                  key={tagIndex}
                                  className="text-xs bg-white/60 text-gray-700 px-2 py-0.5 rounded-full font-medium"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {meal.recipe.tags.length > 2 && (
                                <span className="text-xs bg-white/60 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                                  +{meal.recipe.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                            <div className="bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                              👁️ View Recipe
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="bg-gray-50 border border-gray-200 border-dashed p-3 rounded-xl text-center group hover:bg-gray-100 transition-all duration-300 cursor-pointer"
                          onClick={() => setShowAddDialog(true)}
                        >
                          <div className="text-gray-400 text-xs font-medium mb-1">No meal planned</div>
                          <div className="text-gray-500 text-xs group-hover:text-gray-600 transition-colors">
                            ➕ Click "Add Meal" to plan
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {mealPlans.length === 0 && (
        <div className="glass-card p-12 rounded-3xl text-center animate-fade-in">
          <div className="relative mb-8">
            <Calendar className="h-20 w-20 text-sky-400 mx-auto animate-float" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white animate-pulse" />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gradient-primary mb-4">
            Your Culinary Calendar Awaits! 🍽️
          </h3>
          <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Start planning your delicious meals or let our AI chef create a personalized weekly plan for you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGenerateWeeklyPlan}
              disabled={isGeneratingPlan}
              className="bg-gradient-secondary hover:bg-gradient-accent text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 interactive-scale"
            >
              <Sparkles className="mr-2 h-5 w-5 animate-wiggle" />
              🤖 Generate AI Plan
            </Button>
            <Button
              onClick={() => setShowAddDialog(true)}
              variant="outline"
              className="glass-button border-sky-400/30 text-sky-300 hover:bg-sky-500/10 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 interactive-scale"
            >
              <Plus className="mr-2 h-5 w-5" />
              ➕ Add First Meal
            </Button>
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      <Dialog open={showRecipeModal} onOpenChange={setShowRecipeModal}>
        <DialogContent className="glass-card backdrop-blur-2xl border-white/10 text-white max-w-6xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto rounded-3xl animate-scale-in mx-4 sm:mx-auto">
          {selectedRecipeForModal && (
            <>
              <DialogHeader className="pb-6 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl md:text-3xl font-bold text-gradient-primary mb-2">
                      {selectedRecipeForModal.title}
                    </DialogTitle>
                    <DialogDescription className="text-gray-300 text-base md:text-lg leading-relaxed">
                      {selectedRecipeForModal.description}
                    </DialogDescription>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-gradient-primary px-3 py-1 rounded-full text-xs font-semibold text-white">
                      <Sparkles className="h-3 w-3 animate-pulse" />
                      <span>From Meal Plan</span>
                    </div>
                    <Button
                      onClick={() => setShowRecipeModal(false)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
                {/* Left Column - Image & Stats */}
                <div className="space-y-6">
                  {/* Enhanced Recipe Image */}
                  {/* Recipe Header with Difficulty Badge */}
                  <div className="glass-button p-4 rounded-2xl text-center">
                    <Badge className="bg-gradient-primary text-white font-semibold px-4 py-2 rounded-full shadow-lg">
                      <Star className="h-4 w-4 mr-2" />
                      {selectedRecipeForModal.difficulty?.charAt(0).toUpperCase() + selectedRecipeForModal.difficulty?.slice(1) || 'Medium'} Recipe
                    </Badge>
                  </div>

                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-button p-4 rounded-2xl text-center group hover:bg-sky-500/10 transition-all duration-300">
                      <Clock className="h-6 w-6 text-sky-400 mx-auto mb-2 group-hover:animate-wiggle" />
                      <div className="text-lg font-bold text-white">{selectedRecipeForModal.cookingTime}</div>
                      <div className="text-xs text-gray-400">minutes</div>
                    </div>
                    <div className="glass-button p-4 rounded-2xl text-center group hover:bg-emerald-500/10 transition-all duration-300">
                      <Users className="h-6 w-6 text-emerald-400 mx-auto mb-2 group-hover:animate-wiggle" />
                      <div className="text-lg font-bold text-white">{selectedRecipeForModal.servings}</div>
                      <div className="text-xs text-gray-400">servings</div>
                    </div>
                  </div>

                  {/* YouTube Source Link Section */}
                  <div className="glass-button p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-gradient-secondary mb-4 flex items-center">
                      <Youtube className="h-5 w-5 mr-2 animate-pulse text-red-400" />
                      Video Tutorial
                    </h3>
                    <a
                      href={getYouTubeSearchUrl(selectedRecipeForModal.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-3 px-6 rounded-2xl font-bold text-base transition-all duration-300 interactive-scale shadow-lg hover:shadow-red-500/25"
                    >
                      <Youtube className="h-5 w-5 mr-3 animate-pulse" />
                      <span className="font-bold">Source Link - Watch on YouTube</span>
                      <ExternalLink className="h-4 w-4 ml-3" />
                    </a>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Find step-by-step video tutorials for this recipe
                    </p>
                  </div>

                  {/* Enhanced Tags Section */}
                  {selectedRecipeForModal.tags && selectedRecipeForModal.tags.length > 0 && (
                    <div className="glass-button p-6 rounded-2xl">
                      <h3 className="text-lg font-bold text-gradient-secondary mb-4 flex items-center">
                        <Sparkles className="h-5 w-5 mr-2 animate-pulse" />
                        Recipe Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecipeForModal.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            className="bg-gradient-to-r from-sky-500/20 to-emerald-500/20 text-sky-300 border-sky-400/30 hover:from-sky-500/30 hover:to-emerald-500/30 transition-all duration-300 px-3 py-2 rounded-full interactive-scale"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Ingredients & Instructions */}
                <div className="space-y-6">
                  {/* Enhanced Ingredients */}
                  <div className="glass-button p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-gradient-primary mb-4 flex items-center">
                      <ChefHat className="h-6 w-6 mr-2 animate-float" />
                      Ingredients
                      <div className="ml-2 bg-sky-500/20 text-sky-300 text-xs px-2 py-1 rounded-full">
                        {selectedRecipeForModal.ingredients?.length || 0} items
                      </div>
                    </h3>
                    <ul className="space-y-3">
                      {selectedRecipeForModal.ingredients?.map((ingredient, index) => (
                        <li key={index} className="flex items-start group hover:bg-white/5 p-2 rounded-xl transition-all duration-300">
                          <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 group-hover:animate-pulse">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="text-gray-200 leading-relaxed">{ingredient}</span>
                        </li>
                      )) || (
                        <li className="text-gray-400 italic">No ingredients listed</li>
                      )}
                    </ul>
                  </div>

                  {/* Enhanced Instructions */}
                  <div className="glass-button p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-gradient-accent mb-4 flex items-center">
                      <Star className="h-6 w-6 mr-2 animate-glow" />
                      Instructions
                      <div className="ml-2 bg-amber-500/20 text-amber-300 text-xs px-2 py-1 rounded-full">
                        {selectedRecipeForModal.instructions?.length || 0} steps
                      </div>
                    </h3>
                    <ol className="space-y-4">
                      {selectedRecipeForModal.instructions?.map((instruction, index) => (
                        <li key={index} className="flex items-start group hover:bg-white/5 p-3 rounded-xl transition-all duration-300">
                          <div className="bg-gradient-accent text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 mt-0.5 group-hover:animate-bounce shadow-lg">
                            {index + 1}
                          </div>
                          <span className="text-gray-200 leading-relaxed">{instruction}</span>
                        </li>
                      )) || (
                        <li className="text-gray-400 italic">No instructions provided</li>
                      )}
                    </ol>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => setShowRecipeModal(false)}
                      className="flex-1 bg-gradient-primary hover:bg-gradient-secondary text-white rounded-2xl py-3 font-semibold shadow-lg hover:shadow-sky-500/25 transition-all duration-300 interactive-scale"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      ❤️ Got it, thanks!
                    </Button>
                    <Button
                      onClick={() => {
                        if (selectedRecipeForModal && onSaveRecipe) {
                          onSaveRecipe(selectedRecipeForModal)
                          toast({
                            title: "Recipe Saved! 💝",
                            description: `"${selectedRecipeForModal.title}" added to your saved recipes`,
                          })
                          setShowRecipeModal(false)
                        }
                      }}
                      variant="outline"
                      className="flex-1 glass-button border-white/20 text-white hover:bg-white/10 rounded-2xl py-3 font-semibold interactive-scale"
                    >
                      💝 Save to Collection
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
