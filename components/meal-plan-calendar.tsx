"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, Sparkles, Loader2 } from "lucide-react"
import type { Recipe, MealPlan } from "@/types/recipe"
import { generateMealPlan } from "@/lib/ai-service"
import { useToast } from "@/hooks/use-toast"

interface MealPlanCalendarProps {
  mealPlans: MealPlan[]
  recipes: Recipe[]
  onAddMealPlan: (mealPlan: MealPlan) => void
}

export default function MealPlanCalendar({ mealPlans, recipes, onAddMealPlan }: MealPlanCalendarProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedMeal, setSelectedMeal] = useState<"breakfast" | "lunch" | "dinner">("breakfast")
  const [selectedRecipe, setSelectedRecipe] = useState("")
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
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
        title: "Generating...",
        description: "AI is creating your weekly meal plan",
      })

      const weeklyRecipes = await generateMealPlan(
        "Generate a balanced weekly meal plan with variety including breakfast, lunch, and dinner options",
      )

      if (weeklyRecipes && weeklyRecipes.length > 0) {
        // Clear existing meal plans for this week
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate())

        // Add the generated recipes to the meal plan
        const mealTypes: ("breakfast" | "lunch" | "dinner")[] = ["breakfast", "lunch", "dinner"]

        weeklyRecipes.slice(0, 21).forEach((recipe, index) => {
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
          title: "Success!",
          description: `Generated ${weeklyRecipes.length} recipes for your weekly meal plan`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to generate meal plan. Please try again.",
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Weekly Meal Plan</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateWeeklyPlan}
            disabled={isGeneratingPlan}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isGeneratingPlan ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                AI Weekly Plan
              </>
            )}
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Meal
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Add Meal to Plan</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Schedule a recipe for a specific date and meal
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    min={today.toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Meal Type</label>
                  <Select
                    value={selectedMeal}
                    onValueChange={(value: "breakfast" | "lunch" | "dinner") => setSelectedMeal(value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Recipe</label>
                  <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select a recipe" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {recipes.length > 0 ? (
                        recipes.map((recipe) => (
                          <SelectItem key={recipe.id} value={recipe.id}>
                            {recipe.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-recipes" disabled>
                          No recipes available - create some first!
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddMealPlan}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={!selectedDate || !selectedRecipe || recipes.length === 0}
                >
                  Add to Meal Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDays.map((date, index) => {
          const meals = getMealsForDate(date)
          const isToday = date.toDateString() === today.toDateString()

          return (
            <Card key={index} className={`bg-gray-800 border-gray-700 ${isToday ? "ring-2 ring-orange-500" : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-center">
                  <div className="text-gray-400">{date.toLocaleDateString("en-US", { weekday: "short" })}</div>
                  <div className={`text-lg ${isToday ? "text-orange-500" : "text-white"}`}>{date.getDate()}</div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {["breakfast", "lunch", "dinner"].map((mealType) => {
                  const meal = meals.find((m) => m.mealType === mealType)
                  return (
                    <div key={mealType} className="text-xs">
                      <div className="text-gray-400 capitalize mb-1">{mealType}</div>
                      {meal ? (
                        <div className="bg-gray-700 p-2 rounded text-white">
                          <div className="font-medium line-clamp-2">{meal.recipe.title}</div>
                          <div className="text-gray-400 mt-1">
                            {meal.recipe.cookingTime}m • {meal.recipe.servings} servings
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-700/50 p-2 rounded text-gray-500 text-center">No meal planned</div>
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
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No meal plans yet</h3>
          <p className="text-gray-500">Start planning your meals or let AI create a weekly plan for you!</p>
        </div>
      )}
    </div>
  )
}
