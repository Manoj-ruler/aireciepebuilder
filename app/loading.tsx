import { ChefHat } from "lucide-react"
import AnimatedBackground from "@/components/animated-background"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-beautiful flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 text-center">
        <div className="animate-float mb-6">
          <ChefHat className="h-16 w-16 text-sky-500 mx-auto animate-glow" />
        </div>
        <div className="animate-pulse">
          <h2 className="text-2xl font-bold gradient-text mb-2">Loading Your Culinary Adventure</h2>
          <p className="text-sky-600">Preparing something amazing...</p>
        </div>
      </div>
    </div>
  )
}
