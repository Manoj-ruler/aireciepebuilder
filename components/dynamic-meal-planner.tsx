"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import {
  Sparkles,
  DollarSign,
  Clock,
  ChefHat,
  ShoppingCart,
  Loader2,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Users,
  Star,
} from "lucide-react"
import type { Recipe, MealPlan } from "@/types/recipe"
import { generateDynamicMealPlan, adjustMealPlan } from "@/lib/dynamic-ai-service-new"
import { useAuth } from "@/app/firebase-provider"

interface DynamicMealPlannerProps {
  onAddMealPlan: (mealPlan: MealPlan) => void
  existingPlans: MealPlan[]
}

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

export default function DynamicMealPlanner({ onAddMealPlan, existingPlans }: DynamicMealPlannerProps) {
  const { user } = useAuth()
  const [showPlanner, setShowPlanner] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<Recipe[]>([])
  const [planFeedback, setPlanFeedback] = useState<PlanFeedback[]>([])
  const [activeTab, setActiveTab] = useState("constraints")
  const [estimatedCost, setEstimatedCost] = useState(0)
  const [showSmartRecipeModal, setShowSmartRecipeModal] = useState(false)
  const [selectedSmartRecipe, setSelectedSmartRecipe] = useState<Recipe | null>(null)
  const { toast } = useToast()

  const [constraints, setConstraints] = useState<PlanConstraints>({
    budget: 75,
    maxCookingTime: 45,
    days: 5,
    dietaryRestrictions: [],
    preferredProteins: [],
    avoidIngredients: [],
    skillLevel: "intermediate",
    mealTypes: ["dinner"],
    cuisinePreferences: [],
  })

  const [customPrompt, setCustomPrompt] = useState("")

  const dietaryOptions = [
    "vegetarian",
    "vegan",
    "gluten-free",
    "dairy-free",
    "low-carb",
    "keto",
    "paleo",
    "mediterranean",
    "low-sodium",
    "high-protein",
  ]

  const proteinOptions = ["chicken", "beef", "pork", "fish", "salmon", "shrimp", "tofu", "beans", "eggs"]

  const cuisineOptions = [
    "italian",
    "mexican",
    "asian",
    "indian",
    "mediterranean",
    "american",
    "thai",
    "japanese",
    "french",
    "middle-eastern",
  ]

  const validateConstraints = (): string | null => {
    if (constraints.mealTypes.length === 0) {
      return "Please select at least one meal type"
    }
    if (constraints.days < 1) {
      return "Please select at least 1 day"
    }
    if (constraints.budget < 10) {
      return "Budget must be at least $10"
    }
    return null
  }

  const handleGeneratePlan = async () => {
    const validationError = validateConstraints()
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setCurrentPlan([])
    setPlanFeedback([])

    try {
      let prompt = ""

      if (activeTab === "custom" && customPrompt.trim()) {
        prompt = customPrompt.trim()
      } else {
        // Build prompt from constraints
        const parts = []

        if (constraints.budget > 0) {
          parts.push(`My budget for groceries is $${constraints.budget}`)
        }

        parts.push(`Generate a ${constraints.days}-day meal plan`)

        if (constraints.mealTypes.length > 0) {
          parts.push(`for ${constraints.mealTypes.join(", ")}`)
        }

        if (constraints.maxCookingTime < 60) {
          parts.push(`where each meal takes less than ${constraints.maxCookingTime} minutes to cook`)
        }

        if (constraints.dietaryRestrictions.length > 0) {
          parts.push(`that is ${constraints.dietaryRestrictions.join(" and ")}`)
        }

        if (constraints.preferredProteins.length > 0) {
          parts.push(`using ${constraints.preferredProteins.join(", ")} as proteins`)
        }

        if (constraints.cuisinePreferences.length > 0) {
          parts.push(`with ${constraints.cuisinePreferences.join(", ")} cuisine influences`)
        }

        if (constraints.avoidIngredients.length > 0) {
          parts.push(`avoiding ${constraints.avoidIngredients.join(", ")}`)
        }

        parts.push("Prioritize recipes that share common ingredients to minimize waste and stay within budget")

        prompt = parts.join(" ") + "."
      }

      console.log("🚀 Generating plan with prompt:", prompt)
      console.log("📋 Constraints:", constraints)

      // Add loading toast
      toast({
        title: "🤖 AI Chef Working...",
        description: "Creating your smart meal plan...",
      })

      try {
        const generatedPlan = await generateDynamicMealPlan(prompt, constraints)
        
        console.log("📊 Generated plan result:", generatedPlan)

        if (generatedPlan && generatedPlan.length > 0) {
          console.log("✅ Plan generated successfully:", generatedPlan.length, "recipes")
          setCurrentPlan(generatedPlan)
          setPlanFeedback([])

          // Calculate estimated cost
          const totalCost = generatedPlan.reduce((sum, recipe) => {
            return (
              sum +
              ((recipe as any).estimatedCost || constraints.budget / (constraints.days * constraints.mealTypes.length))
            )
          }, 0)
          setEstimatedCost(totalCost)

          // Switch to results tab
          setActiveTab("results")

          toast({
            title: "🎉 Smart Meal Plan Created!",
            description: `Generated ${generatedPlan.length} personalized recipes for your meal plan`,
          })
        } else {
          throw new Error("No recipes generated")
        }
      } catch (apiError) {
        console.error("❌ API Error:", apiError)
        
        // Fallback: Create a simple meal plan using the regular AI service
        console.log("🔄 Falling back to regular AI service...")
        
        try {
          const { generateMealPlan } = await import("@/lib/ai-service")
          const fallbackPlan = await generateMealPlan(prompt)
          
          if (fallbackPlan && fallbackPlan.length > 0) {
            setCurrentPlan(fallbackPlan)
            setPlanFeedback([])
            setEstimatedCost(constraints.budget)
            setActiveTab("results")
            
            toast({
              title: "🎉 Meal Plan Created!",
              description: `Generated ${fallbackPlan.length} recipes using fallback method`,
            })
          } else {
            throw new Error("Fallback also failed")
          }
        } catch (fallbackError) {
          console.error("❌ Fallback also failed:", fallbackError)
          toast({
            title: "Generation Failed",
            description: "Unable to generate meal plan. Please check your internet connection and try again.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error generating dynamic meal plan:", error)
      toast({
        title: "Error",
        description: "An error occurred while generating your meal plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFeedback = (recipeId: string, rating: "like" | "dislike", feedback: string) => {
    const existingFeedback = planFeedback.find((f) => f.recipeId === recipeId)
    if (existingFeedback) {
      setPlanFeedback((prev) => prev.map((f) => (f.recipeId === recipeId ? { ...f, rating, feedback } : f)))
    } else {
      setPlanFeedback((prev) => [...prev, { recipeId, rating, feedback }])
    }

    toast({
      title: "Feedback Recorded",
      description: `Your ${rating} for this recipe has been noted`,
    })
  }

  const handleAdjustPlan = async (adjustmentRequest: string) => {
    if (currentPlan.length === 0) {
      toast({
        title: "No Plan to Adjust",
        description: "Please generate a meal plan first",
        variant: "destructive",
      })
      return
    }

    setIsAdjusting(true)
    try {
      console.log("Adjusting plan with request:", adjustmentRequest)
      console.log("Current feedback:", planFeedback)

      const adjustedPlan = await adjustMealPlan(currentPlan, planFeedback, adjustmentRequest)

      if (adjustedPlan && adjustedPlan.length > 0) {
        setCurrentPlan(adjustedPlan)
        setPlanFeedback([]) // Reset feedback after adjustment

        // Recalculate cost
        const totalCost = adjustedPlan.reduce((sum, recipe) => {
          return (
            sum +
            ((recipe as any).estimatedCost || constraints.budget / (constraints.days * constraints.mealTypes.length))
          )
        }, 0)
        setEstimatedCost(totalCost)

        toast({
          title: "Plan Adjusted!",
          description: "Your meal plan has been updated based on your feedback",
        })
      } else {
        toast({
          title: "Adjustment Failed",
          description: "Failed to adjust meal plan. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adjusting meal plan:", error)
      toast({
        title: "Error",
        description: "An error occurred while adjusting your meal plan.",
        variant: "destructive",
      })
    } finally {
      setIsAdjusting(false)
    }
  }

  const handleSavePlan = () => {
    if (currentPlan.length === 0) {
      toast({
        title: "No Plan to Save",
        description: "Please generate a meal plan first",
        variant: "destructive",
      })
      return
    }

    try {
      const today = new Date()
      let savedCount = 0

      currentPlan.forEach((recipe, index) => {
        const dayIndex = Math.floor(index / constraints.mealTypes.length)
        const mealTypeIndex = index % constraints.mealTypes.length

        const date = new Date(today)
        date.setDate(today.getDate() + dayIndex)

        const mealType = constraints.mealTypes[mealTypeIndex]

        const mealPlan: MealPlan = {
          id: `dynamic-${Date.now()}-${index}`,
          date: date,
          mealType: mealType,
          recipeId: recipe.id,
          recipe: recipe,
          createdAt: new Date(),
        }

        onAddMealPlan(mealPlan)
        savedCount++
      })

      toast({
        title: "Plan Saved!",
        description: `${savedCount} meals have been added to your calendar`,
      })

      // Close the dialog and reset state
      setShowPlanner(false)
      setCurrentPlan([])
      setPlanFeedback([])
      setActiveTab("constraints")
      setEstimatedCost(0)
    } catch (error) {
      console.error("Error saving meal plan:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save meal plan to calendar",
        variant: "destructive",
      })
    }
  }

  const resetPlanner = () => {
    setCurrentPlan([])
    setPlanFeedback([])
    setActiveTab("constraints")
    setEstimatedCost(0)
    setCustomPrompt("")
  }

  const totalMeals = constraints.days * constraints.mealTypes.length

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Enhanced Dynamic Meal Planner Card */}
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 h-1"></div>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce"></div>
              </div>
              <div>
                <CardTitle className="text-gray-900 text-xl md:text-2xl font-bold">
                  🤖 AI Meal Plan Generator
                </CardTitle>
                <p className="text-gray-600 text-sm md:text-base font-medium">
                  Smart meal planning that adapts to your budget, schedule, and preferences
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                ✨ AI Powered
              </div>
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                🎯 Personalized
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-xs font-semibold text-purple-700">Budget Smart</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-xs font-semibold text-blue-700">Time Aware</div>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-xl">
              <ChefHat className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
              <div className="text-xs font-semibold text-emerald-700">Skill Based</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-xl">
              <Star className="h-6 w-6 text-amber-600 mx-auto mb-2" />
              <div className="text-xs font-semibold text-amber-700">Preference</div>
            </div>
          </div>

          <Dialog
            open={showPlanner}
            onOpenChange={(open) => {
              setShowPlanner(open)
              if (!open) resetPlanner()
            }}
          >
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 hover:from-purple-700 hover:via-blue-700 hover:to-teal-700 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 interactive-scale">
                <ChefHat className="mr-3 h-5 w-5 animate-wiggle" />
                🚀 Create Smart Meal Plan
                <Sparkles className="ml-3 h-5 w-5 animate-pulse" />
              </Button>
            </DialogTrigger>
            
            <DialogContent className="bg-white/95 backdrop-blur-xl border border-gray-200/50 text-gray-900 max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-scale-in">
              <DialogHeader className="pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl md:text-3xl font-bold text-gradient-primary">
                      🤖 AI Meal Plan Generator
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 text-base md:text-lg mt-2">
                      Create a personalized meal plan that perfectly fits your lifestyle
                    </DialogDescription>
                  </div>
                  <div className="hidden md:flex items-center space-x-2">
                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                      ✨ Smart AI
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-1">
                  <TabsTrigger value="constraints" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-700 hover:text-gray-900 rounded-xl font-semibold py-3 px-4 transition-all duration-300">
                    Constraints
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-700 hover:text-gray-900 rounded-xl font-semibold py-3 px-4 transition-all duration-300">
                    Custom Prompt
                  </TabsTrigger>
                  <TabsTrigger value="results" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-700 hover:text-gray-900 rounded-xl font-semibold py-3 px-4 transition-all duration-300">
                    Results {currentPlan.length > 0 && `(${currentPlan.length})`}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="constraints" className="space-y-6">
                  {/* Summary Card */}
                  <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-700 font-semibold">
                            <DollarSign className="inline h-4 w-4 mr-1 text-green-600" />
                            Budget: ${constraints.budget}
                          </span>
                          <span className="text-gray-700 font-semibold">
                            <Clock className="inline h-4 w-4 mr-1 text-blue-600" />
                            Max Time: {constraints.maxCookingTime}m
                          </span>
                          <span className="text-gray-700 font-semibold">
                            <Users className="inline h-4 w-4 mr-1 text-purple-600" />
                            Total Meals: {totalMeals}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-purple-700 border-purple-400 bg-purple-50">
                          {constraints.skillLevel}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Budget & Time */}
                    <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center text-gray-900">
                          <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                          Budget & Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-gray-700 font-semibold">Budget: ${constraints.budget}</Label>
                          <Slider
                            value={[constraints.budget]}
                            onValueChange={(value) => setConstraints((prev) => ({ ...prev, budget: value[0] }))}
                            max={200}
                            min={25}
                            step={5}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>$25</span>
                            <span>${Math.round(constraints.budget / totalMeals)}/meal</span>
                            <span>$200</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-700 font-semibold">Max Cooking Time: {constraints.maxCookingTime} minutes</Label>
                          <Slider
                            value={[constraints.maxCookingTime]}
                            onValueChange={(value) => setConstraints((prev) => ({ ...prev, maxCookingTime: value[0] }))}
                            max={120}
                            min={10}
                            step={5}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>10m</span>
                            <span>Quick & Easy</span>
                            <span>120m</span>
                          </div>
                        </div>
                        <div>
                          <Label>Number of Days</Label>
                          <Select
                            value={constraints.days.toString()}
                            onValueChange={(value) =>
                              setConstraints((prev) => ({ ...prev, days: Number.parseInt(value) }))
                            }
                          >
                            <SelectTrigger className="bg-gray-600 border-gray-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-600 border-gray-500">
                              {[3, 4, 5, 6, 7].map((day) => (
                                <SelectItem key={day} value={day.toString()}>
                                  {day} days
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Meal Types & Skill */}
                    <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center text-gray-900">
                          <Clock className="mr-2 h-4 w-4 text-blue-600" />
                          Meals & Skill Level
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-gray-700 font-semibold">Meal Types *</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {["breakfast", "lunch", "dinner"].map((meal) => (
                              <div key={meal} className="flex items-center space-x-2">
                                <Checkbox
                                  id={meal}
                                  checked={constraints.mealTypes.includes(meal as any)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setConstraints((prev) => ({
                                        ...prev,
                                        mealTypes: [...prev.mealTypes, meal as any],
                                      }))
                                    } else {
                                      setConstraints((prev) => ({
                                        ...prev,
                                        mealTypes: prev.mealTypes.filter((m) => m !== meal),
                                      }))
                                    }
                                  }}
                                />
                                <Label htmlFor={meal} className="capitalize">
                                  {meal}
                                </Label>
                              </div>
                            ))}
                          </div>
                          {constraints.mealTypes.length === 0 && (
                            <p className="text-red-400 text-xs mt-1">Please select at least one meal type</p>
                          )}
                        </div>
                        <div>
                          <Label>Skill Level</Label>
                          <Select
                            value={constraints.skillLevel}
                            onValueChange={(value: any) => setConstraints((prev) => ({ ...prev, skillLevel: value }))}
                          >
                            <SelectTrigger className="bg-gray-600 border-gray-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-600 border-gray-500">
                              <SelectItem value="beginner">Beginner - Simple recipes</SelectItem>
                              <SelectItem value="intermediate">Intermediate - Moderate complexity</SelectItem>
                              <SelectItem value="advanced">Advanced - Complex techniques</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Dietary Restrictions */}
                    <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-sm text-gray-900">Dietary Restrictions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {dietaryOptions.map((option) => (
                            <Badge
                              key={option}
                              variant={constraints.dietaryRestrictions.includes(option) ? "default" : "outline"}
                              className={`cursor-pointer transition-colors ${
                                constraints.dietaryRestrictions.includes(option)
                                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                                  : "hover:bg-purple-50 text-gray-700 border-gray-300"
                              }`}
                              onClick={() => {
                                if (constraints.dietaryRestrictions.includes(option)) {
                                  setConstraints((prev) => ({
                                    ...prev,
                                    dietaryRestrictions: prev.dietaryRestrictions.filter((d) => d !== option),
                                  }))
                                } else {
                                  setConstraints((prev) => ({
                                    ...prev,
                                    dietaryRestrictions: [...prev.dietaryRestrictions, option],
                                  }))
                                }
                              }}
                            >
                              {option}
                            </Badge>
                          ))}
                        </div>
                        {constraints.dietaryRestrictions.length > 0 && (
                          <p className="text-xs text-gray-400 mt-2">
                            Selected: {constraints.dietaryRestrictions.join(", ")}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Preferred Proteins */}
                    <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-sm text-gray-900">Preferred Proteins</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {proteinOptions.map((protein) => (
                            <Badge
                              key={protein}
                              variant={constraints.preferredProteins.includes(protein) ? "default" : "outline"}
                              className={`cursor-pointer transition-colors ${
                                constraints.preferredProteins.includes(protein)
                                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                                  : "hover:bg-orange-50 text-gray-700 border-gray-300"
                              }`}
                              onClick={() => {
                                if (constraints.preferredProteins.includes(protein)) {
                                  setConstraints((prev) => ({
                                    ...prev,
                                    preferredProteins: prev.preferredProteins.filter((p) => p !== protein),
                                  }))
                                } else {
                                  setConstraints((prev) => ({
                                    ...prev,
                                    preferredProteins: [...prev.preferredProteins, protein],
                                  }))
                                }
                              }}
                            >
                              {protein}
                            </Badge>
                          ))}
                        </div>
                        {constraints.preferredProteins.length > 0 && (
                          <p className="text-xs text-gray-400 mt-2">
                            Selected: {constraints.preferredProteins.join(", ")}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Cuisine Preferences */}
                    <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-sm md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-sm text-gray-900">Cuisine Preferences</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {cuisineOptions.map((cuisine) => (
                            <Badge
                              key={cuisine}
                              variant={constraints.cuisinePreferences.includes(cuisine) ? "default" : "outline"}
                              className={`cursor-pointer transition-colors ${
                                constraints.cuisinePreferences.includes(cuisine)
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "hover:bg-gray-600"
                              }`}
                              onClick={() => {
                                if (constraints.cuisinePreferences.includes(cuisine)) {
                                  setConstraints((prev) => ({
                                    ...prev,
                                    cuisinePreferences: prev.cuisinePreferences.filter((c) => c !== cuisine),
                                  }))
                                } else {
                                  setConstraints((prev) => ({
                                    ...prev,
                                    cuisinePreferences: [...prev.cuisinePreferences, cuisine],
                                  }))
                                }
                              }}
                            >
                              {cuisine}
                            </Badge>
                          ))}
                        </div>
                        {constraints.cuisinePreferences.length > 0 && (
                          <p className="text-xs text-gray-400 mt-2">
                            Selected: {constraints.cuisinePreferences.join(", ")}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Avoid Ingredients */}
                    <Card className="bg-gray-700 border-gray-600 md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-sm">Ingredients to Avoid</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Input
                          placeholder="Enter ingredients to avoid (comma-separated): nuts, shellfish, mushrooms"
                          value={constraints.avoidIngredients.join(", ")}
                          onChange={(e) => {
                            const ingredients = e.target.value
                              .split(",")
                              .map((i) => i.trim())
                              .filter((i) => i)
                            setConstraints((prev) => ({ ...prev, avoidIngredients: ingredients }))
                          }}
                          className="bg-gray-600 border-gray-500"
                        />
                      </CardContent>
                    </Card>
                  </div>

                  <Button
                    onClick={handleGeneratePlan}
                    disabled={isGenerating || constraints.mealTypes.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 h-12"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating Dynamic Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Dynamic Meal Plan ({totalMeals} meals)
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                  <div>
                    <Label>Custom Prompt</Label>
                    <Textarea
                      placeholder="Example: 'My budget for groceries this week is $75. Generate a 5-day dinner plan that is low-carb and uses chicken at least twice. Prioritize recipes that share common ingredients to minimize waste.'"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white min-h-[120px] mt-2"
                    />
                    <p className="text-xs text-gray-400 mt-1">{customPrompt.length}/500 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Example Prompts:</Label>
                    <div className="space-y-2">
                      {[
                        "I have a busy week. Create a 3-day meal plan where dinner takes less than 20 minutes to cook each night.",
                        "My budget for groceries this week is $50. Generate a 4-day vegetarian dinner plan that uses beans and lentils as primary proteins.",
                        "Create a 5-day low-carb meal plan for lunch and dinner that avoids dairy and uses fish at least 3 times.",
                        "Generate a 7-day breakfast plan under $30 that's high-protein and takes less than 10 minutes to prepare.",
                      ].map((example, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setCustomPrompt(example)}
                          className="text-left h-auto p-3 bg-gray-700 border-gray-600 hover:bg-gray-600 text-white w-full justify-start"
                        >
                          <Edit3 className="mr-2 h-3 w-3 flex-shrink-0" />
                          {example}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleGeneratePlan}
                    disabled={isGenerating || !customPrompt.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700 h-12"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate from Custom Prompt
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="results" className="space-y-4">
                  {isGenerating ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Your Dynamic Plan...</h3>
                      <p className="text-gray-400">AI is creating personalized recipes based on your constraints</p>
                      <div className="mt-4 text-sm text-gray-500">This may take a few moments...</div>
                    </div>
                  ) : currentPlan.length > 0 ? (
                    <div className="space-y-6">
                      {/* Plan Summary */}
                      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">Your Dynamic Meal Plan</h3>
                              <p className="text-green-700 text-sm">
                                {currentPlan.length} recipes • Estimated cost: ${estimatedCost.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleAdjustPlan("Make the flavors milder and less spicy")}
                                disabled={isAdjusting}
                                variant="outline"
                                size="sm"
                                className="border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white bg-purple-500/10"
                              >
                                {isAdjusting ? (
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                ) : (
                                  <RefreshCw className="mr-2 h-3 w-3" />
                                )}
                                Adjust Plan
                              </Button>
                              <Button onClick={handleSavePlan} className="bg-green-600 hover:bg-green-700" size="sm">
                                <ShoppingCart className="mr-2 h-3 w-3" />
                                Save to Calendar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recipe Grid */}
                      <div className="grid gap-4">
                        {currentPlan.map((recipe, index) => {
                          const dayNumber = Math.floor(index / constraints.mealTypes.length) + 1
                          const mealType = constraints.mealTypes[index % constraints.mealTypes.length]
                          const feedback = planFeedback.find((f) => f.recipeId === recipe.id)

                          return (
                            <Card
                              key={recipe.id}
                              className="bg-white/95 backdrop-blur-sm border border-gray-200/50 hover:border-sky-400/50 transition-all duration-300 cursor-pointer hover:shadow-lg"
                              onClick={() => {
                                setSelectedSmartRecipe(recipe)
                                setShowSmartRecipeModal(true)
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="outline" className="text-xs">
                                        Day {dayNumber} • {mealType}
                                      </Badge>
                                      <Badge
                                        variant="secondary"
                                        className={`text-xs ${
                                          recipe.difficulty === "easy"
                                            ? "bg-green-600"
                                            : recipe.difficulty === "medium"
                                              ? "bg-yellow-600"
                                              : "bg-red-600"
                                        }`}
                                      >
                                        {recipe.difficulty}
                                      </Badge>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 text-lg">{recipe.title}</h4>
                                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{recipe.description}</p>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                      <span className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {recipe.cookingTime}m
                                      </span>
                                      <span className="flex items-center">
                                        <Users className="h-3 w-3 mr-1" />
                                        {recipe.servings} servings
                                      </span>
                                      <span className="flex items-center">
                                        <DollarSign className="h-3 w-3 mr-1" />$
                                        {((recipe as any).estimatedCost || 8).toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {recipe.tags.slice(0, 4).map((tag, tagIndex) => (
                                        <Badge key={tagIndex} variant="secondary" className="text-xs bg-gray-600">
                                          {tag}
                                        </Badge>
                                      ))}
                                      {recipe.tags.length > 4 && (
                                        <Badge variant="secondary" className="text-xs bg-gray-600">
                                          +{recipe.tags.length - 4}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2 ml-4">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleFeedback(recipe.id, "like", "I like this recipe")}
                                      className={`border-gray-600 transition-colors ${
                                        feedback?.rating === "like"
                                          ? "bg-green-600 text-white border-green-600"
                                          : "text-gray-300 hover:bg-gray-600"
                                      }`}
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleFeedback(recipe.id, "dislike", "I don't like this recipe")}
                                      className={`border-gray-600 transition-colors ${
                                        feedback?.rating === "dislike"
                                          ? "bg-red-600 text-white border-red-600"
                                          : "text-gray-300 hover:bg-gray-600"
                                      }`}
                                    >
                                      <ThumbsDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>

                      {/* Adjustment Options */}
                      {planFeedback.length > 0 && (
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <Star className="mr-2 h-4 w-4" />
                              Smart Adjustment Options
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {[
                                "Make the flavors milder and less spicy",
                                "Suggest quicker alternatives (under 20 minutes)",
                                "Replace with more budget-friendly options",
                                "Add more vegetarian alternatives",
                                "Focus on one-pot meals for easier cleanup",
                                "Include more make-ahead friendly recipes",
                              ].map((adjustment, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAdjustPlan(adjustment)}
                                  disabled={isAdjusting}
                                  className="border-blue-600 text-blue-200 hover:bg-blue-800 text-left justify-start h-auto p-3"
                                >
                                  <Edit3 className="mr-2 h-3 w-3 flex-shrink-0" />
                                  {adjustment}
                                </Button>
                              ))}
                            </div>
                            <p className="text-xs text-blue-300 mt-2">
                              Based on your feedback, we can adjust the plan to better match your preferences
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ChefHat className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">No plan generated yet</h3>
                      <p className="text-gray-500 mb-4">
                        Set your constraints or use a custom prompt to generate your dynamic meal plan
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          onClick={() => setActiveTab("constraints")}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Set Constraints
                        </Button>
                        <Button
                          onClick={() => setActiveTab("custom")}
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Use Custom Prompt
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Smart Recipe Modal */}
      <Dialog open={showSmartRecipeModal} onOpenChange={setShowSmartRecipeModal}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border border-gray-200/50 text-gray-900 max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
          <DialogHeader className="pb-6 border-b border-gray-200">
            <DialogTitle className="text-2xl md:text-3xl font-bold text-gray-900">
              {selectedSmartRecipe?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base md:text-lg mt-2">
              {selectedSmartRecipe?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedSmartRecipe && (
            <div className="space-y-6">
              {/* Recipe Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-blue-700">{selectedSmartRecipe.cookingTime} min</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-green-700">{selectedSmartRecipe.servings} servings</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <ChefHat className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-purple-700 capitalize">{selectedSmartRecipe.difficulty}</div>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-xl">
                  <DollarSign className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-amber-700">${((selectedSmartRecipe as any).estimatedCost || 8).toFixed(2)}</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {selectedSmartRecipe.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Ingredients and Instructions - Side by Side on Desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ingredients */}
                <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                      <ShoppingCart className="mr-2 h-5 w-5 text-green-600" />
                      Ingredients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedSmartRecipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                      <ChefHat className="mr-2 h-5 w-5 text-blue-600" />
                      Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3">
                      {selectedSmartRecipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-sm font-bold rounded-full mr-3 flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
