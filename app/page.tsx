"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Plus,
  Search,
  Calendar,
  ChefHat,
  Sparkles,
  Heart,
  LogOut,
  User,
} from "lucide-react";
import { useRecipeStore } from "@/store/recipe-store";
import { generateRecipe } from "@/lib/ai-service";
import type { Recipe } from "@/types/recipe";
import RecipeCard from "@/components/recipe-card";
import MealPlanCalendar from "@/components/meal-plan-calendar";
import DynamicMealPlanner from "@/components/dynamic-meal-planner";
import AuthModal from "@/components/auth-modal";
import AnimatedBackground from "@/components/animated-background";
import LoadingScreen from "@/components/loading-screen";
import ErrorBoundary from "@/components/error-boundary";
import { useAuth } from "./firebase-provider";

function HomePageContent() {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const {
    recipes,
    savedRecipes,
    mealPlans,
    isLoading,
    addRecipe,
    saveRecipe,
    addMealPlan,
    setCurrentUser,
    loadUserData,
    clearAll,
  } = useRecipeStore();

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showScrollCTA, setShowScrollCTA] = useState(false);
  const [activeTab, setActiveTab] = useState("recipes");
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    title: "",
    description: "",
    ingredients: [],
    instructions: [],
    cookingTime: 0,
    servings: 0,
    difficulty: "easy",
    tags: [],
  });

  // Handle user authentication and load/save user-specific data
  useEffect(() => {
    if (user?.email) {
      console.log("👤 User logged in:", user.email);
      // Set current user and load their data
      setCurrentUser(user.email);
      loadUserData(user.email);
    } else if (!loading) {
      console.log("👤 User logged out");
      // Clear data when user logs out
      setCurrentUser(null);
      clearAll();
    }
  }, [user, loading, setCurrentUser, loadUserData, clearAll]);

  if (loading) {
    return <LoadingScreen />;
  }

  const handleAIGeneration = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please enter a description for your recipe",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const generatedRecipe = await generateRecipe(aiPrompt);

      if (generatedRecipe) {
        // Add recipe to frontend store (no database needed)
        addRecipe(generatedRecipe);

        // Show success immediately
        toast({
          title: "🎉 Recipe Created!",
          description: `"${generatedRecipe.title}" is ready!`,
        });
        setAiPrompt("");
        
        // Show scroll CTA after recipe creation
        setShowScrollCTA(true);
        
        // Auto-hide CTA after 10 seconds
        setTimeout(() => {
          setShowScrollCTA(false);
        }, 10000);
      } else {
        toast({
          title: "Generation Failed",
          description:
            "Unable to generate recipe. Please try a different prompt.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Recipe generation error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateRecipe = async () => {
    if (!newRecipe.title || !newRecipe.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in the recipe title and description",
        variant: "destructive",
      });
      return;
    }

    const recipe: Recipe = {
      id: Date.now().toString(),
      title: newRecipe.title!,
      description: newRecipe.description!,
      ingredients: newRecipe.ingredients || [],
      instructions: newRecipe.instructions || [],
      cookingTime: newRecipe.cookingTime || 30,
      servings: newRecipe.servings || 2,
      difficulty: newRecipe.difficulty || "easy",
      tags: newRecipe.tags || [],
      createdAt: new Date(),
      userId: user?.uid,
      imageUrl: `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(
        newRecipe.title!
      )}`,
    };

    addRecipe(recipe);
    setShowCreateDialog(false);
    setNewRecipe({
      title: "",
      description: "",
      ingredients: [],
      instructions: [],
      cookingTime: 0,
      servings: 0,
      difficulty: "easy",
      tags: [],
    });

    toast({
      title: "Recipe Added!",
      description: `"${recipe.title}" has been saved to your collection`,
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "Come back soon for more culinary adventures!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="min-h-screen relative bg-gradient-mesh">
      <AnimatedBackground />

      {/* Enhanced Header */}
      {user && (
        <header className="relative z-10 glass-card backdrop-blur-xl border-b border-white/10 px-4 py-6 animate-slide-in-up">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="animate-float">
                <div className="relative">
                  <ChefHat className="h-10 w-10 text-sky-400 animate-glow" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-primary rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient-primary text-shadow">
                  AI Recipe Builder
                </h1>
                <p className="text-sm text-sky-600/80 font-medium">Powered by Advanced AI</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 glass-button px-4 py-2 rounded-2xl">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-sky-700">Welcome back!</p>
                  <p className="text-xs text-sky-600 truncate max-w-32">{user.email}</p>
                </div>
              </div>
              <Button
                onClick={handleSignOut}
                className="glass-button hover:bg-red-500/20 border-red-200/30 text-red-600 hover:text-red-700 transition-all duration-300 rounded-2xl px-6 py-3 interactive-scale"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Enhanced Hero Section */}
      <section className="relative z-10 py-12 md:py-20 lg:py-24 px-4 text-center animate-fade-in">
        <div className="max-w-6xl mx-auto">
          {/* Hero Title */}
          <div className="flex flex-col md:flex-row items-center justify-center mb-8 md:mb-12 space-y-4 md:space-y-0 md:space-x-6">
            <div className="animate-float">
              <div className="relative">
                <ChefHat className="h-16 w-16 md:h-20 lg:h-24 text-sky-400 animate-glow" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-secondary rounded-full animate-bounce"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-accent rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gradient-primary text-shadow-lg animate-slide-in-up">
                AI Recipe Builder
              </h1>
              <div className="flex items-center justify-center md:justify-start mt-2 space-x-2">
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div>
                <p className="text-sm md:text-base text-sky-600/80 font-semibold">Next-Gen Culinary AI</p>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>

          {/* Hero Description */}
          <div className="animate-slide-in-up delay-200">
            <p className="text-lg md:text-xl lg:text-2xl text-sky-700 mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed font-medium text-shadow">
              🚀 Discover, create, and plan your meals with the power of advanced AI. 
              <span className="text-gradient-secondary font-semibold"> Generate personalized recipes</span> from your ingredients or 
              <span className="text-gradient-accent font-semibold"> let our AI plan your entire week</span>.
            </p>
          </div>



          {!user ? (
            <div className="space-y-6 animate-scale-in delay-400">
              <Button
                onClick={() => setShowAuthModal(true)}
                size="lg"
                className="bg-gradient-primary hover:bg-gradient-secondary text-white px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 animate-float interactive-scale"
              >
                <Sparkles className="mr-3 h-6 w-6 animate-wiggle" />
                Start Your Culinary Journey
                <div className="ml-3 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </Button>
              <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-6">
                <p className="text-sky-600 text-sm md:text-base font-semibold">
                  ✨ Join thousands of home chefs creating amazing meals
                </p>
                <div className="flex items-center space-x-1">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-gradient-secondary rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-gradient-accent rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-xs text-sky-500 ml-2">+5,000 chefs</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-scale-in delay-400">
              {/* AI Prompt Section */}
              <div className="glass-card p-6 md:p-8 rounded-3xl max-w-4xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-sky-700">AI Chef Online</span>
                  </div>
                </div>
                <Textarea
                  placeholder="🍳 Ask AI: 'Create a high-protein vegan pasta recipe for 2 people' or 'What can I make with chicken, rice, and spinach?' or 'I want a quick 15-minute dinner recipe'"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="glass-button border-white/20 text-sky-800 placeholder-sky-500 min-h-[120px] md:min-h-[140px] text-base md:text-lg resize-none rounded-2xl font-medium focus-ring transition-all duration-300"
                />
                <div className="flex items-center justify-between mt-4 text-xs text-sky-600">
                  <span>{aiPrompt.length}/500 characters</span>
                  <div className="flex items-center space-x-2">
                    <span>Powered by</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div>
                      <span className="font-semibold">Gemini AI</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleAIGeneration}
                disabled={isGenerating}
                size="lg"
                className="bg-gradient-primary hover:bg-gradient-secondary text-white px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 interactive-scale disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    <span className="animate-pulse">AI Chef is Cooking...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-3 h-6 w-6 animate-wiggle" />
                    Generate Recipe with AI
                    <div className="ml-3 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </>
                )}
              </Button>

              {/* Loading State */}
              {isGenerating && (
                <div className="glass-card p-6 rounded-2xl max-w-md mx-auto animate-pulse">
                  <div className="flex items-center justify-center space-x-3">
                    <ChefHat className="h-6 w-6 text-sky-400 animate-bounce" />
                    <p className="text-sky-600 font-semibold">
                      Using advanced AI to create your perfect recipe...
                    </p>
                  </div>
                  <div className="mt-4 flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                <Button
                  onClick={() => setAiPrompt("Create a healthy breakfast recipe under 15 minutes")}
                  variant="outline"
                  className="glass-button text-sky-700 border-sky-200/50 hover:bg-sky-50/50 rounded-2xl px-4 py-2 text-sm interactive-scale"
                >
                  🌅 Quick Breakfast
                </Button>
                <Button
                  onClick={() => setAiPrompt("Generate a vegetarian dinner for 4 people")}
                  variant="outline"
                  className="glass-button text-emerald-700 border-emerald-200/50 hover:bg-emerald-50/50 rounded-2xl px-4 py-2 text-sm interactive-scale"
                >
                  🥗 Vegetarian Dinner
                </Button>
                <Button
                  onClick={() => setAiPrompt("Create a dessert recipe with chocolate")}
                  variant="outline"
                  className="glass-button text-amber-700 border-amber-200/50 hover:bg-amber-50/50 rounded-2xl px-4 py-2 text-sm interactive-scale"
                >
                  🍫 Sweet Dessert
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>  

      {/* Scroll Down CTA - appears after recipe creation */}
      {showScrollCTA && user && (
        <div className="relative z-20 max-w-4xl mx-auto px-4 -mt-4 mb-8 animate-slide-in-up">
          <div className="glass-card backdrop-blur-xl border border-emerald-200/50 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 p-6 rounded-3xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center animate-bounce">
                  <ChefHat className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-800">🎉 Recipe Created Successfully!</h3>
                  <p className="text-emerald-700 font-medium">Your new recipe is ready to view below</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => {
                    // Switch to recipes tab using state
                    setActiveTab("recipes");
                    
                    // Hide the CTA
                    setShowScrollCTA(false);
                    
                    // Scroll to the recipes section with a slight delay to allow tab switch
                    setTimeout(() => {
                      const recipesSection = document.querySelector('#main-tabs');
                      if (recipesSection) {
                        recipesSection.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'start',
                          inline: 'nearest'
                        });
                      }
                    }, 200);
                  }}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 interactive-scale"
                >
                  👀 View Recipe
                  <div className="ml-2 animate-bounce">⬇️</div>
                </Button>
                <Button
                  onClick={() => setShowScrollCTA(false)}
                  variant="ghost"
                  size="sm"
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-full p-2"
                >
                  ✕
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {user && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          {/* Dynamic Meal Planner */}
          <div className="mb-8">
            <DynamicMealPlanner
              onAddMealPlan={addMealPlan}
              existingPlans={mealPlans}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-slide-in-up" id="main-tabs">
            {/* Enhanced Clean Tab Navigation */}
            <div className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-1 mb-8 shadow-sm">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-transparent gap-1 p-0">
                <TabsTrigger
                  value="recipes"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 rounded-xl font-semibold py-4 px-6 transition-all duration-300 flex items-center justify-center space-x-2 text-sm md:text-base"
                >
                  <ChefHat className="h-4 w-4" />
                  <span className="hidden sm:inline">My Recipes</span>
                  <span className="sm:hidden">Recipes</span>
                  <div className="ml-2 bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-bold min-w-[24px] text-center">
                    {recipes.length}
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="saved"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 rounded-xl font-semibold py-4 px-6 transition-all duration-300 flex items-center justify-center space-x-2 text-sm md:text-base"
                >
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Saved</span>
                  <span className="sm:hidden">Saved</span>
                  <div className="ml-2 bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-full font-bold min-w-[24px] text-center">
                    {savedRecipes.length}
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="meal-plan"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 rounded-xl font-semibold py-4 px-6 transition-all duration-300 flex items-center justify-center space-x-2 text-sm md:text-base"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Meal Plan</span>
                  <span className="sm:hidden">Plan</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="recipes" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-4 top-4 h-5 w-5 text-sky-500" />
                    <Input
                      placeholder="Search recipes by name or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 bg-white/95 backdrop-blur-sm border border-gray-200/50 text-gray-900 placeholder-gray-500 rounded-2xl h-12 font-medium focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all duration-300"
                    />
                  </div>
                </div>
                <Dialog
                  open={showCreateDialog}
                  onOpenChange={setShowCreateDialog}
                >
                  <DialogTrigger asChild>
                    <Button className="btn-primary text-white rounded-2xl px-6 py-3 font-medium">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Recipe
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-dark backdrop-blur-md border-white/20 text-white max-w-2xl rounded-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl gradient-text">
                        Create New Recipe
                      </DialogTitle>
                      <DialogDescription className="text-sky-200">
                        Add your own recipe to your collection
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-sky-200">
                          Recipe Title *
                        </Label>
                        <Input
                          id="title"
                          value={newRecipe.title}
                          onChange={(e) =>
                            setNewRecipe({
                              ...newRecipe,
                              title: e.target.value,
                            })
                          }
                          className="glass border-white/20 text-white rounded-xl"
                          placeholder="Enter recipe name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description" className="text-sky-200">
                          Description *
                        </Label>
                        <Textarea
                          id="description"
                          value={newRecipe.description}
                          onChange={(e) =>
                            setNewRecipe({
                              ...newRecipe,
                              description: e.target.value,
                            })
                          }
                          className="glass border-white/20 text-white rounded-xl"
                          placeholder="Describe your recipe"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cookingTime" className="text-sky-200">
                            Cooking Time (minutes)
                          </Label>
                          <Input
                            id="cookingTime"
                            type="number"
                            value={newRecipe.cookingTime}
                            onChange={(e) =>
                              setNewRecipe({
                                ...newRecipe,
                                cookingTime: Number.parseInt(e.target.value),
                              })
                            }
                            className="glass border-white/20 text-white rounded-xl"
                            placeholder="30"
                          />
                        </div>
                        <div>
                          <Label htmlFor="servings" className="text-sky-200">
                            Servings
                          </Label>
                          <Input
                            id="servings"
                            type="number"
                            value={newRecipe.servings}
                            onChange={(e) =>
                              setNewRecipe({
                                ...newRecipe,
                                servings: Number.parseInt(e.target.value),
                              })
                            }
                            className="glass border-white/20 text-white rounded-xl"
                            placeholder="4"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleCreateRecipe}
                        className="w-full btn-primary text-white rounded-xl py-3 font-medium"
                        disabled={!newRecipe.title || !newRecipe.description}
                      >
                        Create Recipe
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="text-center">
                    <div className="animate-float mb-4">
                      <ChefHat className="h-12 w-12 text-sky-500 mx-auto animate-glow" />
                    </div>
                    <p className="text-sky-600 font-medium">
                      Loading your recipes...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map((recipe) => (
                    <div key={recipe.id} className="card-hover">
                      <RecipeCard
                        recipe={recipe}
                        onSave={() => saveRecipe(recipe)}
                        isSaved={savedRecipes.some(
                          (saved) => saved.id === recipe.id
                        )}
                      />
                    </div>
                  ))}
                </div>
              )}

              {filteredRecipes.length === 0 && !isLoading && (
                <div className="text-center py-16">
                  <div className="animate-float mb-6">
                    <ChefHat className="h-20 w-20 text-sky-400 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-semibold text-sky-600 mb-3">
                    No recipes found
                  </h3>
                  <p className="text-sky-500 mb-6 font-medium">
                    {searchQuery
                      ? "Try a different search term"
                      : "Start by creating your first recipe or use AI to generate one!"}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() =>
                        setAiPrompt("Create a delicious and easy dinner recipe")
                      }
                      className="btn-primary text-white rounded-2xl px-6 py-3 font-medium"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Your First Recipe
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedRecipes.map((recipe) => (
                  <div key={recipe.id} className="card-hover">
                    <RecipeCard
                      recipe={recipe}
                      onSave={() => saveRecipe(recipe)}
                      isSaved={true}
                    />
                  </div>
                ))}
              </div>

              {savedRecipes.length === 0 && (
                <div className="text-center py-16">
                  <div className="animate-float mb-6">
                    <Heart className="h-20 w-20 text-emerald-400 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-semibold text-emerald-600 mb-3">
                    No saved recipes
                  </h3>
                  <p className="text-emerald-500 font-medium">
                    Save your favorite recipes to access them quickly!
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="meal-plan" className="space-y-6">
              <MealPlanCalendar
                mealPlans={mealPlans}
                recipes={recipes}
                onAddMealPlan={(mealPlan) => addMealPlan(mealPlan)}
                onSaveRecipe={(recipe) => saveRecipe(recipe)}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <ErrorBoundary>
      <HomePageContent />
    </ErrorBoundary>
  );
}
