import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { User } from 'lucide-react'

interface AuthScreenProps {
  onAuthSuccess: () => void
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        
        // Auto-confirm the user's email
        if (data.user) {
          try {
            await supabase.functions.invoke('auto-confirm-user', {
              body: { user_id: data.user.id }
            })
            
            // Now sign in the user
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            })
            if (signInError) throw signInError
          } catch (confirmError) {
            console.error('Auto-confirm error:', confirmError)
            // Continue anyway - user can try to sign in
          }
        }
      }
      onAuthSuccess()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    setError('')
    
    // Demo user credentials
    const demoEmail = 'demo@goalsapp.com'
    const demoPassword = 'demo123456'
    
    try {
      // Try to sign in first
      let { error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })
      
      // If user doesn't exist, create and auto-confirm demo account
      if (error && error.message.includes('Invalid login credentials')) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
        })
        
        if (signUpError) throw signUpError
        
        // Auto-confirm the demo user's email
        if (data.user) {
          try {
            await supabase.functions.invoke('auto-confirm-user', {
              body: { user_id: data.user.id }
            })
          } catch (confirmError) {
            console.error('Auto-confirm error:', confirmError)
          }
        }
        
        // Try signing in again after creating and confirming account
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword,
        })
        
        if (signInError) throw signInError
      } else if (error) {
        throw error
      }
      
      onAuthSuccess()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Goals Tracker</h1>
          <p className="text-gray-600 mt-2">Track your goals and achieve success</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white font-semibold py-3 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-green-500 text-white font-semibold py-3 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : 'Try Demo Account'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Demo account gives you access to pre-loaded goals and tasks</p>
        </div>
      </div>
    </div>
  )
}

export default AuthScreen