import React, { useEffect, useState } from 'react'
import { Target, TrendingUp, CheckCircle2 } from 'lucide-react'

interface SplashScreenProps {
  onComplete: () => void
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 100)

    // Fade out after 1.2 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 1200)

    // Complete after fade out animation (1.5s total)
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 1500)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <div className="text-center space-y-8 px-4">
        {/* App Logo/Icon */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping opacity-30">
            <div className="bg-white rounded-full w-24 h-24 mx-auto"></div>
          </div>
          <div className="relative bg-white/20 backdrop-blur-lg rounded-3xl p-6 mx-auto w-24 h-24 flex items-center justify-center shadow-2xl border border-white/30">
            <Target className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* App Name */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Goals Tracker
          </h1>
          <p className="text-white/80 text-lg font-medium">
            Achieve Your Dreams
          </p>
        </div>

        {/* Animated Icons */}
        <div className="flex items-center justify-center space-x-6">
          <div className="animate-bounce" style={{ animationDelay: '0ms' }}>
            <TrendingUp className="w-6 h-6 text-white/70" />
          </div>
          <div className="animate-bounce" style={{ animationDelay: '150ms' }}>
            <Target className="w-6 h-6 text-white/70" />
          </div>
          <div className="animate-bounce" style={{ animationDelay: '300ms' }}>
            <CheckCircle2 className="w-6 h-6 text-white/70" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-white rounded-full transition-all duration-100 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-white/60 text-sm font-medium animate-pulse">
          Loading your goals...
        </p>
      </div>
    </div>
  )
}

export default SplashScreen
