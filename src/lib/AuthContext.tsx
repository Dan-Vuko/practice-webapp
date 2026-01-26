import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from './supabase'

interface AdminUser {
  username: string
  email?: string
  isGoogleUser?: boolean
}

interface AuthContextType {
  user: AdminUser | null
  loading: boolean
  signInAsAdmin: (username: string) => void
  signInWithGoogle: () => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'speedbuilder_admin'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for Supabase session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          username: session.user.email || 'Google User',
          email: session.user.email,
          isGoogleUser: true
        })
        setLoading(false)
        return
      }

      // Fall back to localStorage admin
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          setUser(JSON.parse(stored))
        } catch {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          username: session.user.email || 'Google User',
          email: session.user.email,
          isGoogleUser: true
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInAsAdmin = (username: string) => {
    const adminUser = { username }
    setUser(adminUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser))
  }

  const signInWithGoogle = async () => {
    // Always redirect to production URL for Google OAuth
    const redirectUrl = 'https://practice-webapp-speedbuilder.vercel.app'

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    })
  }

  const signOut = async () => {
    // Sign out from Supabase if Google user
    if (user?.isGoogleUser) {
      await supabase.auth.signOut()
    }
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInAsAdmin, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
