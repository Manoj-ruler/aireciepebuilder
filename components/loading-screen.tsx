"use client"

import { ChefHat, Sparkles, Heart, Star } from "lucide-react"

interface LoadingScreenProps {
  message?: string
  submessage?: string
}

export default function LoadingScreen({ 
  message = "Loading Your Culinary Adventure", 
  submessage = "Preparing something amazing..." 
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-primary rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-secondary rounded-full opacity-15 animate-float delay-1000"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-gradient-accent rounded-full opacity-10 animate-float delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-primary rounded-full opacity-25 animate-float delay-500"></div>
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Animated Chef Hat */}
        <div className="relative mb-8">
          <div className="animate-float">
            <ChefHat className="h-20 w-20 text-sky-500 mx-auto animate-glow" />
          </div>
          
          {/* Floating Icons */}
          <div className="absolute -top-4 -left-4">
            <Sparkles className="h-6 w-6 text-amber-400 animate-bounce" />
          </div>
          <div className="absolute -top-2 -right-6">
            <Heart className="h-5 w-5 text-pink-400 animate-heartbeat" />
          </div>
          <div className="absolute -bottom-2 -left-6">
            <Star className="h-4 w-4 text-emerald-400 animate-wiggle" />
          </div>
          <div className="absolute -bottom-4 -right-4">
            <Sparkles className="h-5 w-5 text-purple-400 animate-bounce delay-500" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gradient-primary animate-slide-in-up">
            {message}
          </h2>
          <p className="text-sky-600 font-medium animate-slide-in-up delay-200">
            {submessage}
          </p>
        </div>

        {/* Loading Animation */}
        <div className="mt-8 animate-slide-in-up delay-400">
          {/* Pulsing Dots */}
          <div className="flex justify-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-sky-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-200"></div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-primary rounded-full animate-shimmer"></div>
          </div>
        </div>

        {/* Fun Loading Messages */}
        <div className="mt-6 animate-fade-in delay-1000">
          <p className="text-sm text-sky-500 font-medium">
            🧑‍🍳 AI Chef is warming up the kitchen...
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2 text-xs text-sky-400 font-medium">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Powered by Advanced AI</span>
        </div>
      </div>
    </div>
  )
}