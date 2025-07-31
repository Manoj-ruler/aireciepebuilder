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
  } = useRecipeStore();

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
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

  // No need to fetch data - everything is stored in frontend now!

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-beautiful flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 text-center">
          <div className="animate-float mb-6">
            <ChefHat className="h-16 w-16 text-sky-500 mx-auto animate-glow" />
          </div>
          <div className="animate-pulse">
            <h2 className="text-2xl font-bold gradient-text mb-2">
              Loading Your Culinary Adventure
            </h2>
            <p className="text-sky-600">Preparing something amazing...</p>
          </div>
        </div>
      </div>
    );
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
    <div className="min-h-screen relative bg-gradient-beautiful">
      <AnimatedBackground />

      {/* Header */}
      {user && (
        <header className="relative z-10 glass backdrop-blur-md border-b border-white/20 px-4 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <div className="animate-float">
                <ChefHat className="h-8 w-8 text-sky-500 mr-3 animate-glow" />
              </div>
              <h1 className="text-xl font-bold gradient-text">
                AI Recipe Builder
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sky-700">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">
                  {user.email}
                </span>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-sky-200 text-sky-700 hover:bg-sky-50 bg-white/50 backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <div className="animate-float mr-4">
              <ChefHat className="h-20 w-20 text-sky-500 animate-glow" />
            </div>
            <h1 className="text-7xl font-bold gradient-text animate-float">
              AI Recipe Builder
            </h1>
          </div>
          <p className="text-xl text-sky-700 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
            Discover, create, and plan your meals with the power of AI. Generate
            personalized recipes from your ingredients or let our AI plan your
            entire week.
          </p>

          {!user ? (
            <div className="space-y-6">
              <Button
                onClick={() => setShowAuthModal(true)}
                size="lg"
                className="btn-primary text-white px-10 py-6 text-lg font-semibold rounded-2xl animate-float"
              >
                <Sparkles className="mr-3 h-6 w-6" />
                Start Your Culinary Journey
              </Button>
              <p className="text-sky-600 text-sm font-medium">
                Join thousands of home chefs creating amazing meals
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
                <div className="flex-1">
                  <Textarea
                    placeholder="🍳 Ask AI: 'Create a high-protein vegan pasta recipe for 2 people' or 'What can I make with chicken, rice, and spinach?' or 'I want a quick 15-minute dinner recipe'"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="glass backdrop-blur-md border-white/30 text-sky-800 placeholder-sky-500 min-h-[140px] text-lg resize-none rounded-2xl font-medium"
                  />
                </div>
              </div>
              <Button
                onClick={handleAIGeneration}
                disabled={isGenerating}
                size="lg"
                className="btn-primary text-white px-10 py-6 text-lg font-semibold rounded-2xl animate-float"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    AI Chef is Cooking...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-3 h-6 w-6" />
                    Generate Recipe with AI
                  </>
                )}
              </Button>
              {isGenerating && (
                <p className="text-sky-600 text-sm animate-pulse font-medium">
                  Using advanced AI to create your perfect recipe...
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {user && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          {/* Dynamic Meal Planner */}
          <div className="mb-8">
            <DynamicMealPlanner
              onAddMealPlan={addMealPlan}
              existingPlans={mealPlans}
            />
          </div>

          <Tabs defaultValue="recipes" className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass backdrop-blur-md mb-8 p-2 rounded-2xl">
              <TabsTrigger
                value="recipes"
                className="data-[state=active]:bg-sky-500 data-[state=active]:text-white rounded-xl font-medium"
              >
                <ChefHat className="mr-2 h-4 w-4" />
                My Recipes ({recipes.length})
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-xl font-medium"
              >
                <Heart className="mr-2 h-4 w-4" />
                Saved ({savedRecipes.length})
              </TabsTrigger>
              <TabsTrigger
                value="meal-plan"
                className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white rounded-xl font-medium"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Meal Plan ({mealPlans.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recipes" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-4 top-4 h-5 w-5 text-sky-500" />
                    <Input
                      placeholder="Search recipes by name or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 glass backdrop-blur-md border-white/30 text-sky-800 rounded-2xl h-12 font-medium"
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
