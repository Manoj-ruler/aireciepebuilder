"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "@/lib/firebase"

interface User {
  uid: string
  email: string | null
  displayName?: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("🔥 Setting up Firebase auth listener...")
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      console.log("🔥 Auth state changed:", firebaseUser?.email || "No user")
      
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        }
        setUser(user)
        console.log("✅ User authenticated:", user.email)
      } else {
        setUser(null)
        console.log("❌ User signed out")
      }
      
      setLoading(false)
    }, (error) => {
      console.error("🔥 Auth state change error:", error)
      setLoading(false)
    })

    return () => {
      console.log("🔥 Cleaning up auth listener")
      unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      console.log("🔥 Attempting to sign in:", email)
      
      // Basic validation
      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address")
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("✅ Sign in successful:", userCredential.user.email)
      
      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      console.error("❌ Sign in error:", error)
      
      // Provide user-friendly error messages
      let errorMessage = "Failed to sign in. Please try again."
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address."
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later."
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection."
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please try again."
      }
      
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    try {
      console.log("🔥 Attempting to sign up:", email)
      
      // Basic validation
      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address")
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log("✅ Sign up successful:", userCredential.user.email)
      
      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      console.error("❌ Sign up error:", error)
      
      // Provide user-friendly error messages
      let errorMessage = "Failed to create account. Please try again."
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists. Try signing in instead."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please choose a stronger password."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address."
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection."
      }
      
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      console.log("🔥 Attempting Google sign in...")
      
      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')
      
      const userCredential = await signInWithPopup(auth, provider)
      console.log("✅ Google sign in successful:", userCredential.user.email)
      
      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      console.error("❌ Google sign in error:", error)
      
      // Provide user-friendly error messages
      let errorMessage = "Failed to sign in with Google. Please try again."
      
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign in was cancelled. Please try again."
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups and try again."
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection."
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMessage = "Sign in was cancelled. Please try again."
      }
      
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      console.log("🔥 Signing out...")
      await firebaseSignOut(auth)
      console.log("✅ Sign out successful")
      
      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      console.error("❌ Sign out error:", error)
      throw new Error("Failed to sign out. Please try again.")
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
