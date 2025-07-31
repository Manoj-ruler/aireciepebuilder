"use client"

import React from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ChunkErrorBoundaryState {
  hasError: boolean
  error?: Error
  isChunkError: boolean
}

interface ChunkErrorBoundaryProps {
  children: React.ReactNode
}

class ChunkErrorBoundary extends React.Component<ChunkErrorBoundaryProps, ChunkErrorBoundaryState> {
  constructor(props: ChunkErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, isChunkError: false }
  }

  static getDerivedStateFromError(error: Error): ChunkErrorBoundaryState {
    const isChunkError = 
      error.name === 'ChunkLoadError' || 
      error.message.includes('Loading chunk') ||
      error.message.includes('Loading CSS chunk') ||
      error.message.includes('timeout')

    return { 
      hasError: true, 
      error,
      isChunkError 
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🚨 Chunk loading error caught:", error, errorInfo)
    
    // If it's a chunk loading error, try to reload after a short delay
    if (this.state.isChunkError) {
      console.log("🔄 Chunk loading error detected, will attempt reload...")
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, isChunkError: false })
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isChunkError) {
        return (
          <div className="min-h-screen bg-gradient-beautiful flex items-center justify-center p-4">
            <Card className="max-w-md w-full glass backdrop-blur-md border-orange-200">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
                  <RefreshCw className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-orange-800">Loading Issue Detected</CardTitle>
                <CardDescription className="text-orange-600">
                  We're having trouble loading some resources. This usually resolves quickly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-700">
                    This is typically caused by network issues or server updates. 
                    Refreshing the page usually fixes this.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={this.handleReload} 
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Page
                  </Button>
                  <Button
                    onClick={this.handleRetry}
                    variant="outline"
                    className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    Try Again
                  </Button>
                </div>
                <Button
                  onClick={this.handleGoHome}
                  variant="ghost"
                  className="w-full text-orange-600 hover:bg-orange-50"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Home
                </Button>
                <p className="text-xs text-orange-500 text-center">
                  If this problem persists, try clearing your browser cache or contact support.
                </p>
              </CardContent>
            </Card>
          </div>
        )
      }

      // For non-chunk errors, show generic error boundary
      return (
        <div className="min-h-screen bg-gradient-beautiful flex items-center justify-center p-4">
          <Card className="max-w-md w-full glass backdrop-blur-md border-red-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-red-800">Something went wrong</CardTitle>
              <CardDescription className="text-red-600">
                We encountered an unexpected error. Don't worry, your data is safe!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 font-mono">
                  {this.state.error?.message || "An unknown error occurred"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={this.handleRetry} 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ChunkErrorBoundary