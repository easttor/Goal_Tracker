import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    console.log('[Auth] Initializing auth provider')
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('[Auth] Fetching initial session')
        const { data: { session } } = await supabase.auth.getSession()
        console.log('[Auth] Session fetched:', session ? 'User logged in' : 'No session')
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error('[Auth] Error fetching session:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes - KEEP SIMPLE, avoid any async operations in callback
    console.log('[Auth] Setting up auth state listener')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('[Auth] Auth state changed:', _event, session ? 'User logged in' : 'No session')
        setUser(session?.user ?? null)
      }
    )

    return () => {
      console.log('[Auth] Cleaning up auth listener')
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}