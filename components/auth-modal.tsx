"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/app/firebase-provider"
import { Loader2, Mail, Eye, EyeOff, AlertCircle } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("signin")
  const { toast } = useToast()
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setShowPassword(false)
    setIsLoading(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const validateForm = () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return false
    }

    if (!email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return false
    }

    if (!password) {
      toast({
        title: "Password Required",
        description: "Please enter your password",
        variant: "destructive",
      })
      return false
    }

    if (activeTab === "signup" && password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSignIn = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await signIn(email, password)
      toast({
        title: "Welcome back! 👋",
        description: "You've been signed in successfully",
      })
      handleClose()
    } catch (error: any) {
      console.error("Sign in error:", error)
      let errorMessage = "Failed to sign in. Please try again."

      if (error.message.includes("user-not-found")) {
        errorMessage = "No account found with this email address."
      } else if (error.message.includes("wrong-password")) {
        errorMessage = "Incorrect password. Please try again."
      } else if (error.message.includes("invalid-email")) {
        errorMessage = "Please enter a valid email address."
      } else if (error.message.includes("too-many-requests")) {
        errorMessage = "Too many failed attempts. Please try again later."
      }

      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await signUp(email, password)
      toast({
        title: "Account Created! 🎉",
        description: "Welcome to AI Recipe Builder!",
      })
      handleClose()
    } catch (error: any) {
      console.error("Sign up error:", error)
      let errorMessage = "Failed to create account. Please try again."

      if (error.message.includes("email-already-in-use")) {
        errorMessage = "An account with this email already exists. Try signing in instead."
      } else if (error.message.includes("weak-password")) {
        errorMessage = "Password is too weak. Please choose a stronger password."
      } else if (error.message.includes("invalid-email")) {
        errorMessage = "Please enter a valid email address."
      }

      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
      toast({
        title: "Welcome! 🎉",
        description: "You've been signed in with Google successfully",
      })
      handleClose()
    } catch (error: any) {
      console.error("Google sign in error:", error)
      let errorMessage = "Failed to sign in with Google. Please try again."

      if (error.message.includes("popup-closed-by-user")) {
        errorMessage = "Sign in was cancelled. Please try again."
      } else if (error.message.includes("popup-blocked")) {
        errorMessage = "Popup was blocked. Please allow popups and try again."
      }

      toast({
        title: "Google Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Welcome to AI Recipe Builder</DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            Sign in to save your recipes and create personalized meal plans
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="signin" className="data-[state=active]:bg-orange-600">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-orange-600">
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter your email"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <div className="relative">
                <Input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white pr-10"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            <Button onClick={handleSignIn} disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter your email"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white pr-10"
                  placeholder="Create a password (min 6 characters)"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <AlertCircle className="h-3 w-3" />
                <span>Password must be at least 6 characters long</span>
              </div>
            </div>
            <Button onClick={handleSignUp} disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-800 px-2 text-gray-400">Or continue with</span>
          </div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          variant="outline"
          className="w-full border-gray-600 text-white hover:bg-gray-700 bg-transparent"
        >
          <Mail className="mr-2 h-4 w-4" />
          {isLoading ? "Signing in..." : "Continue with Google"}
        </Button>

        <div className="text-center text-xs text-gray-500">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  )
}
